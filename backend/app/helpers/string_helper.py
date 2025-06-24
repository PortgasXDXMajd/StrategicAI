import re
import json
import uuid


class StringHelper:
    @classmethod
    def clean_string(cls, s: str):
        s = s.strip('`').strip()
        s = re.sub(r'^```*json\s*', '', s, flags=re.IGNORECASE)
        s = re.sub(r'.*```$', '', s, flags=re.IGNORECASE)
        s = re.sub(r'"\s*:\s*"', '": "', s).strip()
        return s

    @classmethod
    def extract_json_from_string(cls, input_string: str):
        input_string = cls.clean_string(input_string)
        
        json_pattern = r'(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}|\[(?:[^\[\]]|\[(?:[^\[\]]|\[[^\[\]]*\])*\])*\])'

        matches = re.findall(json_pattern, input_string, re.DOTALL)

        for match in matches:
            try:
                parsed_json = json.loads(match)
                if isinstance(parsed_json, list) and all(isinstance(item, str) for item in parsed_json):
                    return parsed_json
                elif isinstance(parsed_json, (dict, list)):
                    return parsed_json
            except json.JSONDecodeError:
                continue

        return None

    @staticmethod
    def generate_uuid():
        return str(uuid.uuid4())


