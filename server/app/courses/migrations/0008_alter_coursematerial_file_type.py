# Generated by Django 5.2 on 2025-05-08 13:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0007_remove_coursematerial_material_file_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coursematerial',
            name='file_type',
            field=models.CharField(max_length=50),
        ),
    ]
