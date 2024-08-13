import os
import datetime
import re
import pdfplumber
from PyPDF2 import PdfReader, PdfWriter
from django.db import models
from django.contrib.auth.models import User
from ckeditor.fields import RichTextField

# Función para extraer el NIF de una página de un PDF
def extract_nif_from_page(pdf_page):
    nif_pattern = re.compile(r'\b\d{8}[A-HJ-NP-TV-Z]\b')
    text = pdf_page.extract_text()
    if text:
        nif_matches = nif_pattern.findall(text)
        if nif_matches:
            return nif_matches[0]  # Devuelve el primer NIF encontrado
    return None

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dni = models.CharField(max_length=9)

    def __str__(self):
        return self.user.username
    
class Nomina(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)  # Permitir nulos
    year = models.IntegerField(blank=True, null=True)
    month = models.CharField(max_length=20, blank=True, null=True)
    file = models.FileField(upload_to='nóminas/')

    class Meta:
        unique_together = ('user', 'year', 'month')

    def __str__(self):
        if self.user:
            return f"{self.user.username} - {self.month} {self.year}"
        return f"Sin asignar - {self.month} {self.year}"

    def save(self, *args, **kwargs):
        # Primero guarda el archivo para que esté disponible en self.file.path
        super(Nomina, self).save(*args, **kwargs)

        # Procesar el PDF después de guardarlo
        self.process_pdf()

    def process_pdf(self):
        # Divide el PDF y asigna las páginas a los usuarios correspondientes
        self.split_pdf_and_assign_to_user(self.file.path)

    @staticmethod
    def extract_month_and_year_from_page(pdf_page):
        month_pattern = re.compile(
            r'(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)', re.I)
        year_pattern = re.compile(r'\b(19[3-9]\d|20\d{2}|2100)\b')

        month = ""
        year = None

        text = pdf_page.extract_text()
        if not text:
            return month, year  # Retorna vacío si no hay texto
        month_matches = month_pattern.findall(text)
        current_year = datetime.datetime.now().year
        year_matches = year_pattern.findall(text)

        if month_matches:
            month = month_matches[-1]

        for year_match in year_matches:
            year = int(year_match)
            if 1930 <= year <= current_year + 1:
                break

        return month, year

    def split_pdf_and_assign_to_user(self, pdf_file):
        pdf_reader = PdfReader(pdf_file)
        output_folder = os.path.dirname(pdf_file)

        for page_number, pdf_page in enumerate(pdf_reader.pages):
            pdf_writer = PdfWriter()
            pdf_writer.add_page(pdf_page)

            # Extraer NIF, mes y año de la página actual
            nif = extract_nif_from_page(pdf_page)
            month, year = self.extract_month_and_year_from_page(pdf_page)

            # Si no se encuentra un NIF, aún crea el archivo
            if nif and month and year:
                file_name = f"{nif}_{year}_{month}_page_{page_number + 1}.pdf"
                output_file_path = os.path.join(output_folder, file_name)

                # Guardar la página dividida
                with open(output_file_path, "wb") as output_pdf:
                    pdf_writer.write(output_pdf)

                # Verificar si el usuario con el DNI correspondiente existe
                try:
                    user = User.objects.get(profile__dni=nif)
                except User.DoesNotExist:
                    user = None  # Permitir que el usuario no esté asignado

                # Crear la nueva instancia de Nomina, incluso si no existe el usuario
                Nomina.objects.create(
                    user=user,
                    year=year,
                    month=month.capitalize(),
                    file=os.path.join('nóminas', file_name)
                )
                print(f"Nomina guardada para el usuario con NIF {nif} (usuario {'asignado' if user else 'no asignado'}).")
            else:
                print(f"No se pudo extraer NIF, mes o año en la página {page_number + 1}.")

class Post(models.Model):
    title = models.CharField(max_length=200)
    summary = models.CharField(max_length=500, blank=True, null=True)
    content = RichTextField()
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    pdf = models.FileField(upload_to='pdf/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class PostView(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} viewed {self.post.title}'
