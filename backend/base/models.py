from django.db import models
import os
from ckeditor.fields import RichTextField
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dni = models.CharField(max_length=9)

    def __str__(self):
        return self.user.username


class Nomina(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Permitir nulos temporalmente
    year = models.IntegerField(blank=True, null=True)
    # Permitir nulos temporalmente
    month = models.CharField(max_length=20, blank=True, null=True)
    file = models.FileField(upload_to='nóminas/')

    class Meta:
        unique_together = ('user', 'year', 'month')

    def __str__(self):
        return f"{self.user.username} - {self.month} {self.year}"

    def save(self, *args, **kwargs):
        # Primero guarda el archivo
        super(Nomina, self).save(*args, **kwargs)

        # Verificar que el archivo haya sido guardado correctamente
        if not os.path.exists(self.file.path):
            raise FileNotFoundError(
                f"El archivo no se encuentra en la ruta: {self.file.path}")

        # Después de guardar, procesa el PDF
        self.process_pdf()

    def process_pdf(self):
        from .process_pdfs import extract_month_and_year_from_pdf, split_pdf_and_save_to_django

        # Extraer el mes y el año del archivo PDF
        month, year = extract_month_and_year_from_pdf(self.file.path)
        if not month or not year:
            raise ValueError(
                "No se pudo extraer el mes o el año del archivo PDF.")

        # Asignar los valores extraídos a la instancia
        self.year = year
        self.month = month.capitalize()

        # Definir el output_folder para guardar los archivos procesados
        output_folder = os.path.join(
            os.path.dirname(self.file.path), 'processed')
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # Llamar a la función para dividir el PDF y guardarlo
        split_pdf_and_save_to_django(self.file.path, output_folder)

        # Finalmente, guarda la instancia con los datos actualizados
        super(Nomina, self).save(update_fields=['year', 'month'])


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
