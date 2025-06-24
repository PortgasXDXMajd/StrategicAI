import TaskService from '@/services/TaskService';
import { Task } from '@/utils/types/task';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Decision, DecisionItem } from '../types/tree_res';
import { TreeDecision } from '../types/tree_decision';

class TaskDocumentGenerator {
  private taskId: string;

  constructor(taskId: string) {
    this.taskId = taskId;
  }

  private async fetchTaskDetails(): Promise<Task> {
    try {
      const task = await TaskService.getTaskById(this.taskId);
      return task as Task;
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  }

  public async generateWordDocument(): Promise<void> {
    try {
      const taskDetails = await this.fetchTaskDetails();

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Task Title: ${taskDetails.title}\n\n`,
                    bold: true,
                    break: 1,
                  }),
                  new TextRun({
                    text: '\nTask Context:',
                    bold: true,
                    break: 1,
                  }),
                  new TextRun(
                    taskDetails.user_description || 'No context provided.'
                  ),
                ],
              }),
              ...((taskDetails.root_cause_analysis?.payload as Decision)?.items
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '\nRoot Cause Analysis:\n',
                          bold: true,
                          break: 1,
                        }),
                      ],
                    }),
                    ...(
                      taskDetails.root_cause_analysis?.payload as Decision
                    ).items.map(
                      (cause: DecisionItem, index: number) =>
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${index + 1}. ${cause.item} (Certainty: ${cause.certainty}%)`,
                              break: 1,
                            }),
                            new TextRun({ text: cause.explanation, break: 1 }),
                          ],
                        })
                    ),
                  ]
                : []),
              ...(taskDetails.how_trees_decisions
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '\nSolutions:\n',
                          bold: true,
                          break: 1,
                        }),
                      ],
                    }),
                    ...taskDetails.how_trees_decisions.map(
                      (tree_decision: TreeDecision, index: number) =>
                        new Paragraph({
                          children: [
                            ...(tree_decision.payload as Decision).items.map(
                              (solution: DecisionItem, solIndex: number) =>
                                new TextRun({
                                  text: `  ${String.fromCharCode(97 + solIndex)}. ${solution.item} (Certainty: ${solution.certainty}%)\nExplanation: ${solution.explanation}`,
                                  break: 1,
                                })
                            ),
                          ],
                        })
                    ),
                  ]
                : []),
              ...(taskDetails.hypotheses_tested
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '\nHypothesis Tested:\n',
                          bold: true,
                          break: 1,
                        }),
                      ],
                    }),
                    ...taskDetails.hypotheses_tested.map(
                      (hypothesis: any, index: number) =>
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${index + 1}. ${hypothesis.payload.question} (Certainty: ${hypothesis.payload.certainty}%)`,
                              break: 1,
                            }),
                            new TextRun({
                              text: hypothesis.payload.answer,
                              break: 1,
                            }),
                          ],
                        })
                    ),
                  ]
                : []),
            ],
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `${taskDetails.title}.docx`);
      });
    } catch (error) {
      console.error('Error generating Word document:', error);
    }
  }

  public async generatePDFDocument(): Promise<void> {
    try {
      const taskDetails = await this.fetchTaskDetails();

      const pdfDoc = await PDFDocument.create();
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let yPosition = pageHeight - 50; // Initial top margin
      const margin = 50; // Left and right margin

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const title = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
      const fontSize = 12;
      const lineHeight = fontSize + 5;
      const contentWidth = pageWidth - 2 * margin;

      const addSpacing = (lines: number) => {
        yPosition -= lines * lineHeight;
        if (yPosition < 0) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - 50;
        }
      };

      const wrapText = (text: string, fontToUse: any): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = fontToUse.widthOfTextAtSize(testLine, fontSize);

          if (textWidth > contentWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          lines.push(currentLine);
        }

        return lines;
      };

      const drawText = (text: string, fontToUse: any) => {
        const lines = text
          .split('\n')
          .flatMap((line) => wrapText(line, fontToUse));

        lines.forEach((line) => {
          if (yPosition - lineHeight < 0) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - 50;
          }
          page.drawText(line, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: fontToUse,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        });
      };

      // Add content to PDF
      drawText(`Task Title: ${taskDetails.title}`, title);
      addSpacing(2);

      drawText('Task Context:', title);
      drawText(taskDetails.user_description || 'No context provided.', font);
      addSpacing(2);

      if (taskDetails.root_cause_analysis !== null) {
        drawText('Root Cause Analysis:', title);
        (
          (taskDetails.root_cause_analysis?.payload as Decision).items || []
        ).forEach((cause: DecisionItem, index: number) => {
          drawText(
            `${index + 1}. ${cause.item} (Certainty: ${cause.certainty}%)`,
            boldFont
          );
          drawText(cause.explanation, font);
          addSpacing(1);
        });
        addSpacing(2);
      }

      if (taskDetails.how_trees_decisions !== null) {
        drawText('Solutions:', title);
        (taskDetails.how_trees_decisions || []).forEach(
          (decision: any, index: number) => {
            drawText(
              `Decision ${index + 1}: ${decision.payload.decision}`,
              boldFont
            );
            decision.payload.solutions.forEach(
              (solution: DecisionItem, solIndex: number) => {
                drawText(
                  `  ${String.fromCharCode(97 + solIndex)}. ${solution.item} (Certainty: ${solution.certainty}%)`,
                  boldFont
                );
                drawText(`Explanation: ${solution.explanation}`, font);
                addSpacing(1);
              }
            );
          }
        );
        addSpacing(2);
      }

      if (taskDetails.hypotheses_tested !== null) {
        drawText('Hypothesis Tested:', title);
        (taskDetails.hypotheses_tested || []).forEach(
          (hypothesis: any, index: number) => {
            drawText(
              `${index + 1}. ${hypothesis.payload.question} (Certainty: ${hypothesis.payload.certainty}%)`,
              boldFont
            );
            drawText(hypothesis.payload.answer, font);
            addSpacing(1);
          }
        );
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `${taskDetails.title}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  public async exportAsJSON(): Promise<void> {
    try {
      const taskDetails = await this.fetchTaskDetails();

      const problems =
        (taskDetails.root_cause_analysis?.payload as Decision)?.items?.map(
          (cause) => ({
            problem: cause.item,
            explanation: cause.explanation,
            certainty: cause.certainty,
          })
        ) || [];

      const solutions =
        taskDetails.how_trees_decisions?.flatMap((decision) =>
          (decision.payload as Decision).items?.map((solution) => ({
            solution: solution.item,
            explanation: solution.explanation,
            certainty: solution.certainty,
          }))
        ) || [];

      const jsonData = {
        problems,
        solutions,
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json',
      });

      saveAs(blob, `${taskDetails.title}.json`);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    }
  }
}

export default TaskDocumentGenerator;
