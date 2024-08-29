# -*- coding: utf-8 -*- # Ensure correct handling of text encoding

from PyPDF2 import PdfReader, PdfWriter
import pdfplumber
import re
import os
import datetime
import sys
import shutil


def extract_nif_from_pdf(pdf_file):
    """
    Extracts NIF numbers from a PDF file.

    Arguments:
        pdf_file (str): Path to the PDF file.

    Returns:
        list: A list of extracted NIF numbers.
    """
    print(f"Opening PDF file: {pdf_file}")
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

    print(f"NIFs found: {extracted_nifs}")
    return extracted_nifs


def extract_month_and_year_from_pdf(pdf_file):
    """
    Extracts month and year information from a PDF file.

    Arguments:
        pdf_file (str): Path to the PDF file.

    Returns:
        tuple: A tuple containing the extracted month and year (or default values if not found).
    """
    print(f"Searching for month and year in the PDF file: {pdf_file}")
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


def split_pdf(pdf_file, output_folder):
    """
    Splits a PDF file into individual page PDF files and renames/moves them according to NIF and month.

    Arguments:
        pdf_file (str): Path to the PDF file.
        output_folder (str): Path to the output folder.
    """
    print(f"Splitting PDF: {pdf_file}")
    pdf_reader = PdfReader(pdf_file)

    for page_number, pdf_page in enumerate(pdf_reader.pages):
        pdf_writer = PdfWriter()
        pdf_writer.add_page(pdf_page)
        file_name = os.path.splitext(os.path.basename(pdf_file))[
            0] + f"_page_{page_number + 1}.pdf"
        output_file_path = os.path.join(output_folder, file_name)

        with open(output_file_path, "wb") as output_pdf:
            pdf_writer.write(output_pdf)

        print(f"Page saved: {output_file_path}")


def clean_output_folder(output_folder):
    """Deletes all PDF files in the output folder."""
    print(f"Cleaning output folder: {output_folder}")
    for file in os.listdir(output_folder):
        if file.lower().endswith(".pdf"):
            file_path = os.path.join(output_folder, file)
            print(f"Deleting file: {file_path}")
            os.remove(file_path)


def rename_and_group_pdfs(pdf_folder, pdf_file):
    """
    Renames and groups PDF files by NIF and month, only processes the specified file.

    Arguments:
        pdf_folder (str): Path to the PDF folder.
        pdf_file (str): PDF file name.
    """
    print(f"Renaming and grouping PDFs in folder: {output_folder}")

    for file_name in os.listdir(pdf_folder):
        if file_name.lower().endswith(".pdf"):
            file_path = os.path.join(pdf_folder, file_name)
            nif_numbers = extract_nif_from_pdf(file_path)
            month, year = extract_month_and_year_from_pdf(file_path)

            if not nif_numbers:
                print(f"No NIF found in the file {file_name}.")
                continue

            if not month or year is None:
                print(f"Failed to extract month and year from the file {
                      file_name}.")
                continue

            nif = nif_numbers[0]
            nif_folder = os.path.join(pdf_folder, nif)
            if not os.path.exists(nif_folder):
                os.makedirs(nif_folder)

            year_folder = os.path.join(nif_folder, str(year))
            if not os.path.exists(year_folder):
                os.makedirs(year_folder)

            month_in_uppercase = month.upper()  # Convert the month to uppercase
            new_file_name = f"{month_in_uppercase}.pdf"
            new_file_path = os.path.join(year_folder, new_file_name)

            if os.path.exists(new_file_path):
                # Delete the newly added file if a file with the same name already exists
                print(f"Deleting newly added file: {file_name}")
                os.remove(file_path)
            else:
                print(f"Renaming {file_name} to: {new_file_name}")
                os.rename(file_path, new_file_path)


if __name__ == "__main__":
    # ... rest of the code unchanged

    # Modify the main to pass the file name
    script_directory = os.path.dirname(os.path.abspath(__file__))
    output_folder = "../Nominas"  # Folder where the divisions will be saved
    pdf_file_to_split = sys.argv[1]

    if not os.path.exists(pdf_file_to_split):
        print("The specified PDF file does not exist.")
        sys.exit(1)

    # Split the large PDF into individual pages
    split_pdf(pdf_file_to_split, output_folder)

    # Rename and group the divisions by NIF and month (use the file name)
    rename_and_group_pdfs(output_folder, pdf_file_to_split)
