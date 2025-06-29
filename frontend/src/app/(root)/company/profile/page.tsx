'use client';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Iconify from '@/components/general/Iconify';
import TextAreaDialog from '@/components/dialogs/DataDialog';
import CompanyHelper from '@/redux/helpers/company/CompanyHelper';
import DataDialog from '@/components/dialogs/DataDialog';

const DynamicFieldDisplay = ({
  fields,
}: {
  fields: Record<string, any> | undefined;
}) => (
  <div className="dynamic-fields space-y-4 mt-4">
    {fields &&
      Object.entries(fields).map(([key, value]) => (
        <div key={key} className="dynamic-field flex flex-col">
          <strong className="text-gray-700 dark:text-gray-300">
            {formatLabel(key)}:
          </strong>
          <span className="text-gray-900 dark:text-gray-100 mt-1">
            {renderValue(value)}
          </span>
        </div>
      ))}
  </div>
);

const formatLabel = (label: string) =>
  label.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const renderValue = (value: any) => {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside">
        {value.map((item, idx) => (
          <li key={idx} className="text-gray-900 dark:text-gray-100">
            {item}
          </li>
        ))}
      </ul>
    );
  } else if (typeof value === 'object') {
    return <DynamicFieldDisplay fields={value} />;
  }
  return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
};

const CompanyProfilePage = () => {
  const company = useSelector((state: RootState) => state.company);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditClick = () => {
    setIsDialogOpen(true);
  };

  const handleSave = async (text: string | null, files: File[] | null) => {
    await CompanyHelper.enrichProfile(text, files);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-[70vw] mx-auto bg-white dark:bg-[#1f1f1f] rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Company Profile
        </h1>
        <Button variant={'ghost'} onClick={handleEditClick}>
          <Iconify icon={'line-md:edit'} />
        </Button>
      </div>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Basic Information
        </h2>
        <div className="space-y-2">
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Company Name:
            </strong>{' '}
            <span className="text-gray-900 dark:text-gray-100">
              {company.profile?.company_name}
            </span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Country:
            </strong>{' '}
            <span className="text-gray-900 dark:text-gray-100">
              {company.profile?.country}
            </span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Industry:
            </strong>{' '}
            <span className="text-gray-900 dark:text-gray-100">
              {company.profile?.industry}
            </span>
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">
              Description:
            </strong>{' '}
            <span className="text-gray-900 dark:text-gray-100">
              {company.profile?.description}
            </span>
          </p>
        </div>
      </section>

      {company.profile?.dynamic_fields && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Additional Details
          </h2>
          <DynamicFieldDisplay fields={company.profile?.dynamic_fields} />
        </section>
      )}
      {
        <DataDialog
          onSave={handleSave}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          title={'Enrich your profile'}
          description={'Tell us what you want us to know about your company'}
          onCancel={() => {}}
        />
      }
    </div>
  );
};

export default CompanyProfilePage;
