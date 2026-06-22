# -*- coding: utf-8 -*-
"""将功能说明.md 转换为 PDF"""
import sys, re, os
sys.path.insert(0, r'C:\Users\admin\.workbuddy\binaries\python\envs\default\Lib\site-packages')
from fpdf import FPDF

MD_FILE = r'E:\FuyaoLib\20260611journal_checkin\check-in-report\功能说明.md'
PDF_FILE = r'E:\FuyaoLib\20260611journal_checkin\check-in-report\功能说明.pdf'

class JournalReportPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('CJK', '', 8)
            self.cell(0, 8, '期刊签收统计报告 — 功能说明', align='C')
            self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('CJK', '', 8)
        self.cell(0, 10, f'第 {self.page_no()} 页', align='C')

def md_to_pdf():
    pdf = JournalReportPDF()
    pdf.add_font('CJK', '', r'C:\Windows\Fonts\msyh.ttc')
    pdf.add_font('CJK', 'B', r'C:\Windows\Fonts\msyhbd.ttc')
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    with open(MD_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_list = False

    for raw_line in lines:
        line = raw_line.rstrip('\n\r')

        # skip separators
        if line.strip() == '---':
            continue
        if not line.strip():
            in_list = False
            continue

        stripped = line.strip()

        # --- h1 title ---
        if stripped.startswith('# ') and '功能说明' in stripped:
            pdf.set_font('CJK', 'B', 18)
            pdf.multi_cell(0, 10, stripped[2:], align='C')
            pdf.ln(5)
            continue

        # --- h2 ---
        if stripped.startswith('## '):
            in_list = False
            pdf.ln(3)
            pdf.set_font('CJK', 'B', 13)
            pdf.set_text_color(0, 80, 140)
            pdf.cell(0, 9, stripped[3:], new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            pdf.ln(1)
            continue

        # --- bullet ---
        if stripped.startswith('- '):
            in_list = True
            text = stripped[2:]
            text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
            pdf.set_font('CJK', '', 10)
            pdf.multi_cell(0, 5.5, '  ' + text, new_x="LMARGIN", new_y="NEXT")
            continue

        # --- regular paragraph ---
        if in_list:
            in_list = False

        text = re.sub(r'\*\*(.*?)\*\*', r'\1', stripped)
        pdf.set_font('CJK', '', 10)
        pdf.multi_cell(0, 5.5, text, new_x="LMARGIN", new_y="NEXT")

    pdf.output(PDF_FILE)
    print(f'PDF 已生成: {PDF_FILE}')
    print(f'文件大小: {os.path.getsize(PDF_FILE)/1024:.0f} KB')

if __name__ == '__main__':
    md_to_pdf()
