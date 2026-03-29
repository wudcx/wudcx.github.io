import re

with open('cpp-interview-questions.md', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
result = []
skip_mode = False
i = 0

while i < len(lines):
    line = lines[i]
    
    # Check if line contains Chinese characters
    has_chinese = bool(re.search(r'[\u4e00-\u9fff]', line))
    
    # Keep lines that are structural (headers, PlantUML markers, code blocks)
    if ('### ' in line or '@startuml' in line or '@enduml' in line or 
        line.strip().startswith('```plantuml') or line.strip().startswith('```') or
        '**' in line[:5] or line.startswith('#') or line.startswith('*') or
        line.strip() == '' or
        line.startswith('---') or line.startswith('![') or
        line.startswith('|')):
        result.append(line)
        i += 1
        continue
    
    # If Chinese, skip until we find next structural element
    if has_chinese:
        # Skip this line
        i += 1
        continue
    
    # Regular English content - keep
    result.append(line)
    i += 1

with open('cpp-interview-questions.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(result))

print('Done, lines:', len(result))