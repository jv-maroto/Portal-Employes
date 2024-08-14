from django.contrib import admin
from django import forms
from .models import Post, PostView, Nomina
from ckeditor.widgets import CKEditorWidget
from django.contrib.admin import AdminSite


class PostAdminForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorWidget())
    summary = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = Post
        fields = ['title', 'summary', 'content', 'image', 'pdf']


class NominaUploadForm(forms.ModelForm):
    class Meta:
        model = Nomina
        fields = ['file']  # Solo mostramos el campo para subir el archivo PDF

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['file'].label = "Seleccionar archivo PDF"


class NominaAdmin(admin.ModelAdmin):
    form = NominaUploadForm
    list_display = ('user', 'year', 'month')
    search_fields = ['user__username', 'user__profile__dni']
    list_filter = ('year', 'month')
    list_per_page = 20

    def save_model(self, request, obj, form, change):
        # Asegúrate de que el user_id se establezca si no está presente
        if not obj.user_id:
            obj.user_id = request.user.id  # Usa el ID del usuario

        # Guarda el objeto para que se cree la instancia en la base de datos
        super().save_model(request, obj, form, change)

        # Luego, procesa el PDF
        obj.process_pdf()

    def get_form(self, request, obj=None, **kwargs):
        # Especifica el formulario a utilizar
        kwargs['form'] = NominaUploadForm
        return super().get_form(request, obj, **kwargs)

    def add_view(self, request, form_url='', extra_context=None):
        # Cambia el título en la vista de agregar para mayor claridad
        extra_context = extra_context or {}
        extra_context['title'] = 'Subir archivo PDF para dividir en nóminas'
        return super(NominaAdmin, self).add_view(request, form_url, extra_context=extra_context)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Modifica la vista de cambio si es necesario
        extra_context = extra_context or {}
        extra_context['title'] = 'Modificar archivo PDF o detalles de nómina'
        return super().change_view(request, object_id, form_url, extra_context=extra_context)

    class Media:
        # Incluir el JS y CSS para la barra de progreso si es necesario
        js = ('admin/js/custom_admin.js',)
        css = {'all': ('admin/css/custom_admin.css',)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    form = PostAdminForm
    list_display = ('title', 'summary', 'created_at', 'updated_at')
    search_fields = ('title', 'content', 'summary')

    class Media:
        css = {
            # Incluye tu archivo CSS de Bootstrap
            'all': ('css/bootstrap.min.css',)
        }
        # Incluye tu archivo JS de Bootstrap
        js = ('js/bootstrap.bundle.min.js',)


class PostAdminSite(AdminSite):
    site_header = 'Sagrera Canarias Administración de Noticias'
    site_title = 'Sagrera Canarias Administración de Noticias'
    index_title = 'Bienvenido a la administración de posts'


class PostViewAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'viewed_at')
    readonly_fields = ('post', 'user', 'viewed_at')

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser


admin.site.register(PostView, PostViewAdmin)
admin.site.register(Nomina, NominaAdmin)
post_admin_site = PostAdminSite(name='post_admin')
post_admin_site.register(Post, PostAdmin)
