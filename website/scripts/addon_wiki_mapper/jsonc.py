"""Small JSONC reader for bridge. projects.

Bedrock packs commonly contain line comments and trailing commas, so the
standard json module needs a conservative preprocessing pass.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


def strip_comments(source: str) -> str:
    result: list[str] = []
    index = 0
    in_string = False
    escaped = False

    while index < len(source):
        char = source[index]
        following = source[index + 1] if index + 1 < len(source) else ""

        if in_string:
            result.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            index += 1
            continue

        if char == '"':
            in_string = True
            result.append(char)
            index += 1
            continue

        if char == "/" and following == "/":
            index += 2
            while index < len(source) and source[index] not in "\r\n":
                index += 1
            continue

        if char == "/" and following == "*":
            index += 2
            while index + 1 < len(source) and source[index:index + 2] != "*/":
                if source[index] in "\r\n":
                    result.append(source[index])
                index += 1
            index += 2
            continue

        result.append(char)
        index += 1

    return "".join(result)


def loads(source: str) -> Any:
    without_comments = strip_comments(source)
    without_trailing_commas = re.sub(r",\s*([}\]])", r"\1", without_comments)
    return json.loads(without_trailing_commas)


def load(path: Path) -> Any:
    return loads(path.read_text(encoding="utf-8-sig"))
