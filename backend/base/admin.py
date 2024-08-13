from django.contrib import admin
from django import forms
from .models import Post
from ckeditor.widgets import CKEditorWidget
from django.contrib.admin import AdminSite


class PostAdminForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorWidget())
    summary = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = Post
        fields = ['title', 'summary', 'content', 'image', 'pdf']


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
    site_header = 'Administración de Posts'
    site_title = 'Administración de Posts'
    index_title = 'Bienvenido a la administración de posts'


post_admin_site = PostAdminSite(name='post_admin')
post_admin_site.register(Post, PostAdmin)
