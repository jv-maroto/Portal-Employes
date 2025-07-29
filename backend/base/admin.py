from django.contrib import admin, messages
from django import forms
from .models import Post, PostView, PdfFile
from django.contrib.admin import AdminSite
# from ckeditor.widgets import CKEditorWidget # Removido por seguridad
from django.utils.translation import ngettext
from django.http import HttpResponseRedirect
from .models import Vacacion

import logging
from django.urls import path, reverse
from django.utils.html import format_html
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class PostAdminForm(forms.ModelForm):
    content = forms.CharField(widget=forms.Textarea(attrs={'rows': 10, 'cols': 80}))
    summary = forms.CharField(widget=forms.Textarea, required=False)
    department = forms.ChoiceField(choices=Post.DEPARTMENT_CHOICES)  # Asegúrate de que este campo está aquí


    class Meta:
        model = Post
        fields = ['title', 'summary', 'content', 'department', 'image', 'pdf','download_only']  # Incluye 'department' aquí


class PdfFileUploadForm(forms.ModelForm):
    class Meta:
        model = PdfFile
        fields = ['file', 'month', 'year']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['file'].label = "Seleccionar archivo PDF"
        self.fields['month'].label = "Mes"
        self.fields['year'].label = "Año"


class PdfFileAdmin(admin.ModelAdmin):
    form = PdfFileUploadForm
    list_display = ('user', 'year', 'month')
    search_fields = ['user__username', 'user__profile__dni']
    list_filter = ('year', 'month')
    list_per_page = 20

    def save_model(self, request, obj, form, change):
        logger.debug(f"Antes de guardar el archivo PDF: {obj}")

        # Primero guarda el archivo PDF
        super().save_model(request, obj, form, change)

        # Luego procesa el archivo PDF
        try:
            obj.process_pdf_and_save()
            logger.debug("PDF procesado y dividido exitosamente")
        except Exception as e:
            logger.error(f"Error al procesar el PDF: {e}")

    def get_form(self, request, obj=None, **kwargs):
        kwargs['form'] = PdfFileUploadForm
        return super().get_form(request, obj, **kwargs)

    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Subir archivo PDF para dividir en páginas'
        return super(PdfFileAdmin, self).add_view(request, form_url, extra_context=extra_context)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Modificar archivo PDF o detalles'
        return super().change_view(request, object_id, form_url, extra_context=extra_context)

    def procesar_todos_los_pdfs(self, request, queryset=None):
        """Acción para procesar todas las Nóminas no registradas."""
        if queryset is None:
            queryset = PdfFile.objects.filter(user__isnull=True)

        # Procesar los PDFs ya registrados en la base de datos pero sin usuario
        for pdf_file in queryset:
            pdf_file.process_pdf_and_save()

        # Procesar los PDFs que están en la carpeta 'media' pero no están registrados en la base de datos
        PdfFile.process_and_save_unregistered_pdfs()

        self.message_user(
            request, "Todas las Nóminas no registradas han sido procesadas.", level=messages.SUCCESS)

        # Redirigir a la página de lista después de procesar
        return HttpResponseRedirect(reverse('admin:base_pdffile_changelist'))

    def get_urls(self):
        """Añadimos la URL personalizada para la acción."""
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('process-nom/', self.admin_site.admin_view(self.procesar_todos_los_pdfs),
                 name='process-nom'),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['custom_button'] = self.get_custom_button()
        return super().changelist_view(request, extra_context=extra_context)

    def get_custom_button(self):
        """Genera un botón que llama a la acción de procesar PDFs."""
        url = reverse('admin:process-nom')
        return format_html(
            '<ul class="object-tools">'
            '<li>'
            '<a href="{}" class="addlink"  style="margin-right: 150px;">Procesar Nominas</a>'
            '</li>'
            '</ul>',
            url
        )

    class Media:
        js = ('admin/js/custom_admin.js',)
        css = {'all': ('admin/css/custom_admin.css',)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    form = PostAdminForm
    list_display = ('title', 'summary', 'created_at', 'updated_at','download_only')
    list_filter = ['department', 'created_at', 'download_only']
    search_fields = ('title', 'content', 'summary')
    
    class Media:
        css = {'all': ('css/bootstrap.min.css',)}
        js = ('js/bootstrap.bundle.min.js',)


class PostAdminSite(AdminSite):
    site_header = 'Sagrera Canarias Administración de Noticias'
    site_title = 'Sagrera Canarias Administración de Noticias'
    index_title = 'Bienvenido a la administración de posts'


post_admin_site = PostAdminSite(name='post_admin')
post_admin_site.register(Post, PostAdmin)


class PostViewAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'viewed_at')
    readonly_fields = ('post', 'user', 'viewed_at')

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser


class VacacionAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista
    list_display = ('user', 'motivo', 'inicio', 'fin', 'email')
    list_filter = ('motivo', 'inicio', 'fin')  # Filtrar por campos
    search_fields = ('user__username', 'email')
    exclude = ('pdf_file',)
    


admin.site.register(Vacacion, VacacionAdmin)

admin.site.register(PostView, PostViewAdmin)
admin.site.register(PdfFile, PdfFileAdmin)
