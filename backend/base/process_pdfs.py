import os
import sys
import datetime
from PyPDF2 import PdfReader, PdfWriter
import pdfplumber
import re
from django.conf import settings
from .models import Nomina, User


def extract_nif_from_pdf(pdf_file):
    extracted_nifs = []
    with pdfplumber.open(pdf_file) as pdf:
        nif_pattern = re.compile(r'\b\d{8}[A-HJ-NP-TV-Z]\b')
        special_nif_pattern = re.compile(
            r'X7288860E')  # Pattern for special case
        print("Extracting text from pages...")
        for page in pdf.pages:
            text = page.extract_text()
            nifs = nif_pattern.findall(text)
            for nif in nifs:
                # Add the full NIF without splitting it into a list of digits
                extracted_nifs.append(nif)

            # Special case handling
            special_nif = special_nif_pattern.search(text)
            if special_nif:
                # Add the special NIF directly
                extracted_nifs.append(special_nif.group())

    return extracted_nifs


def extract_month_and_year_from_pdf(pdf_file):
    with pdfplumber.open(pdf_file) as pdf:
        month_pattern = re.compile(
            r'(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)', re.I)
        year_pattern = re.compile(r'\b(19[3-9]\d|20\d{2}|2100)\b')

        month = ""
        year = None

        for page in pdf.pages:
            text = page.extract_text()
            month_matches = month_pattern.findall(text)
            current_year = datetime.datetime.now().year
            year_matches = year_pattern.findall(text)

            if month_matches:
                month = month_matches[-1]

            for year_match in year_matches:
                year = int(year_match)
                if 1930 <= year <= current_year + 1:
                    break

        if month == "" or year is None:
            print("Month and/or year not found in the entire document")
        else:
            print(f"Month and year found: {month}, {year}")

        return month, year


def split_pdf_and_save_to_django(pdf_file, output_folder):
    """
    Splits a PDF file into individual pages and saves them in the Django database.
    """
    print(f"Splitting and saving PDF: {pdf_file}")
    pdf_reader = PdfReader(pdf_file)

    for page_number, pdf_page in enumerate(pdf_reader.pages):
        pdf_writer = PdfWriter()
        pdf_writer.add_page(pdf_page)
        file_name = os.path.splitext(os.path.basename(pdf_file))[
            0] + f"_page_{page_number + 1}.pdf"
        output_file_path = os.path.join(output_folder, file_name)

        with open(output_file_path, "wb") as output_pdf:
            pdf_writer.write(output_pdf)

        # Extract NIF, month, and year
        nif_numbers = extract_nif_from_pdf(output_file_path)
        month, year = extract_month_and_year_from_pdf(output_file_path)

        if nif_numbers and month and year:
            nif = nif_numbers[0]
            try:
                user = User.objects.get(username=nif)
                nomina = Nomina.objects.create(
                    user=user,
                    year=year,
                    month=month.capitalize(),
                    file=os.path.join('nóminas', os.path.basename(
                        output_file_path))  # Corrected
                )
                nomina.save()
                print(f"Nomina saved for user {user.username}: {file_name}")
            except User.DoesNotExist:
                print(f"No user found with NIF: {nif}")
        else:
            print(f"Skipping file {
                  file_name}, could not extract NIF, month, or year.")


if __name__ == "__main__":
    # Configurar Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    import django
    django.setup()

    # El archivo PDF a procesar
    pdf_file_to_split = sys.argv[1]

    if not os.path.exists(pdf_file_to_split):
        print("The specified PDF file does not exist.")
        sys.exit(1)

    output_folder = "../Nominas"
    split_pdf_and_save_to_django(pdf_file_to_split, output_folder)
