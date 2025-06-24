import json
import inspect

def get_tool_info(method):
    method_name = method.__name__
    signature = inspect.signature(method)
    parameters = signature.parameters
    params_info = {}

    for name, param in parameters.items():
        param_info = {
            "type": str(param.annotation) if param.annotation != inspect.Parameter.empty else "Any",
        }

        if param.default == inspect.Parameter.empty:
            param_info["default"] = None
        else:
            param_info["default"] = param.default

        params_info[name] = param_info

    result = f"""{{"method_name": "{method_name}", "params": {params_info}}}"""

    return result


def get_tools_info(functions):
    tools_info = []

    for func in functions:
        tools_info.append(get_tool_info(func))

    return json.dumps(tools_info, indent=1)
