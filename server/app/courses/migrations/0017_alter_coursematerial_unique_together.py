# Generated by Django 5.2 on 2025-06-22 09:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0016_alter_course_course_code_alter_course_course_name_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='coursematerial',
            unique_together={('course', 'file_name')},
        ),
    ]
