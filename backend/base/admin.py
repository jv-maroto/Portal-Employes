from django.contrib import admin
from django import forms
from .models import Post, PostView, PdfFile  # Cambié Nomina por PdfFile
from django.contrib.admin import AdminSite
from ckeditor.widgets import CKEditorWidget
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class PostAdminForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorWidget())
    summary = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = Post
        fields = ['title', 'summary', 'content', 'image', 'pdf']


class PdfFileUploadForm(forms.ModelForm):
    class Meta:
        model = PdfFile
        fields = ['file', 'month', 'year']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['file'].label = "Seleccionar archivo PDF"
        self.fields['month'].label = "Mes"
        self.fields['year'].label = "Año"


class PdfFileAdmin(admin.ModelAdmin):  # Renombrado desde NominaAdmin
    form = PdfFileUploadForm  # Cambié NominaUploadForm por PdfFileUploadForm
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
        kwargs['form'] = PdfFileUploadForm  # Ajustado para PdfFile
        return super().get_form(request, obj, **kwargs)

    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Subir archivo PDF para dividir en páginas'
        return super(PdfFileAdmin, self).add_view(request, form_url, extra_context=extra_context)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Modificar archivo PDF o detalles'
        return super().change_view(request, object_id, form_url, extra_context=extra_context)

    class Media:
        js = ('admin/js/custom_admin.js',)
        css = {'all': ('admin/css/custom_admin.css',)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    form = PostAdminForm
    list_display = ('title', 'summary', 'created_at', 'updated_at')
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


admin.site.register(PostView, PostViewAdmin)
admin.site.register(PdfFile, PdfFileAdmin)  # Renombrado desde NominaAdmin
