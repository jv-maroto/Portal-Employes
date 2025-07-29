import os
import re
import logging
# CKEditor temporalmente removido por compatibilidad
from PyPDF2 import PdfReader, PdfWriter
from django.db import models
from django.contrib.auth.models import User
import pdfplumber

# Configuración del logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler('procesamiento_pdf.log')
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dni = models.CharField(max_length=9)

    def __str__(self):
        return self.user.username

class PdfFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    year = models.IntegerField()
    month = models.CharField(max_length=20)
    file = models.FileField(upload_to='')

    def __str__(self):
        return f"{self.month} {self.year} - {self.user or 'Usuario no encontrado'}"

    def process_pdf_and_save(self):
        """ Procesa el PDF y lo divide en páginas individuales. """
        pdf_file = self.file.path
        output_folder = os.path.dirname(pdf_file)

        # Verificar si el archivo existe
        if not os.path.exists(pdf_file):
            logger.error(f"El archivo PDF no existe: {pdf_file}")
            return

        logger.debug(f"Dividiendo PDF: {pdf_file} en la carpeta: {output_folder}")
        mes = self.month
        año = self.year

        # Dividir el PDF y obtener los nombres de los archivos divididos
        archivos_divididos = dividir_pdf(pdf_file, output_folder, mes, año)
        archivos_renombrados = renombrar_con_dni(
            archivos_divididos, output_folder, mes, año)
        if archivos_divididos:
            # Crear nuevos registros en la base de datos para cada archivo dividido que cumpla con la regla de nombre
            for archivo in archivos_renombrados:
                dni = archivo.split('_')[0]
                dni = dni.strip()
                usuario = User.objects.filter(username__iexact=dni).first()
                # Verificar si el nombre del archivo cumple con la regla 'dniX_mes_año.pdf'
                if f"_{mes}_{año}.pdf" in archivo:
                    PdfFile.objects.create(
                        user=usuario if usuario else None,
                        year=self.year,
                        month=self.month,
                        file=os.path.join('media', archivo)
                    )
        archivo_nombre = os.path.basename(self.file.name)
        if not (f"_{self.month}_{self.year}.pdf" in archivo_nombre):
            self.delete()

    @staticmethod
    def process_and_save_unregistered_pdfs():
        """Procesa y guarda todos los PDFs no registrados en la carpeta 'media'."""
        media_path = os.path.join('media')
        for root, dirs, files in os.walk(media_path):
            for file in files:
                if file.endswith('.pdf'):
                    file_path = os.path.join(root, file)
                    if not PdfFile.objects.filter(file=os.path.basename(file_path)).exists():
                        logger.debug(f"Procesando archivo no registrado: {file_path}")
                        try:
                            dni, mes, año = file.split('_')[0], file.split('_')[1], file.split('_')[2].split('.')[0]
                        except IndexError:
                            logger.error(f"Formato de archivo incorrecto: {file}")
                            continue

                        archivos_divididos = dividir_pdf(file_path, root, mes, año)
                        archivos_renombrados = renombrar_con_dni(archivos_divididos, root, mes, año)

                        if archivos_divididos:
                            for archivo in archivos_renombrados:
                                dni = archivo.split('_')[0].strip()
                                usuario = User.objects.filter(username__iexact=dni).first()
                                if f"_{mes}_{año}.pdf" in archivo:
                                    PdfFile.objects.create(
                                        user=usuario if usuario else None,
                                        year=int(año),
                                        month=mes,
                                        file=os.path.join('media', archivo)
                                    )

def dividir_pdf(pdf_file, output_folder, mes, año):
    """ Divide el PDF en páginas individuales y elimina el archivo original.
        Devuelve una lista con los nombres de los archivos divididos. """
    archivos_creados = []
    try:
        pdf_reader = PdfReader(pdf_file)
        logger.debug(f"Dividiendo el archivo PDF: {pdf_file}")
        numero_paginas = len(pdf_reader.pages)

        if numero_paginas == 0:
            logger.error("El PDF no tiene páginas.")
            return archivos_creados

        for numero_pagina, pagina_pdf in enumerate(pdf_reader.pages):
            pdf_writer = PdfWriter()
            pdf_writer.add_page(pagina_pdf)
            nombre_archivo = f"dni{numero_pagina + 1}_{mes}_{año}.pdf"
            ruta_archivo_salida = os.path.join(output_folder, nombre_archivo)
            logger.debug(f"Guardando página {numero_pagina + 1} en: {ruta_archivo_salida}")

            with open(ruta_archivo_salida, "wb") as output_pdf:
                pdf_writer.write(output_pdf)

            archivos_creados.append(nombre_archivo)

        os.remove(pdf_file)
        logger.debug(f"Archivo PDF original eliminado: {pdf_file}")

    except Exception as e:
        logger.error(f"Error al dividir el PDF: {e}")

    return archivos_creados

def renombrar_con_dni(archivos, output_folder, mes, año):
    """ Renombra los archivos divididos usando el DNI extraído y los vincula con un usuario si existe. """
    archivos_renombrados = []
    dni_pattern = re.compile(r'\b\d{8}[A-HJ-NP-TV-Z]\b')

    for archivo in archivos:
        ruta_archivo = os.path.join(output_folder, archivo)
        with pdfplumber.open(ruta_archivo) as pdf:
            pagina = pdf.pages[0]
            texto = pagina.extract_text()
            dni_match = dni_pattern.search(texto)
            dni = dni_match.group() if dni_match else "desconocido"

        nuevo_nombre = f"{dni}_{mes}_{año}.pdf"
        nueva_ruta = os.path.join(output_folder, nuevo_nombre)
        # Si el archivo destino ya existe, no lo renombres ni lo crees, solo pasa al siguiente
        if os.path.exists(nueva_ruta):
            os.remove(ruta_archivo)
            continue
        os.rename(ruta_archivo, nueva_ruta)
        logger.debug(f"Archivo renombrado: {ruta_archivo} a {nueva_ruta}")

        archivos_renombrados.append(nuevo_nombre)

    return archivos_renombrados

class Vacacion(models.Model):
    MOTIVO_CHOICES = [
        ('Vacaciones', 'Vacaciones'),
        ('Días Libres', 'Días Libres'),
        ('Permisos', 'Permisos'),
        ('Enfermedad', 'Enfermedad'),
        # Puedes añadir más tipos si lo necesitas
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.CharField(max_length=20)
    motivo = models.CharField(max_length=50, choices=MOTIVO_CHOICES)
    inicio = models.DateField()
    fin = models.DateField()
    email = models.EmailField()
    firma = models.ImageField(upload_to='firmas/', blank=True, null=True)
    file = models.FileField(upload_to='vacaciones/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.motivo} ({self.inicio} a {self.fin})"

class Post(models.Model):
    DEPARTMENT_CHOICES = [
        ('RRHH', 'Recursos Humanos'),
        ('IT', 'Informática'),
        ('FIN', 'Finanzas'),
        # ...otros departamentos...
    ]
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, default='RRHH')
    title = models.CharField(max_length=200)
    summary = models.CharField(max_length=500, blank=True, null=True)
    content = models.TextField('Contenido')
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    pdf = models.FileField(upload_to='pdf/', blank=True, null=True)
    download_only = models.BooleanField(default=False)
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
