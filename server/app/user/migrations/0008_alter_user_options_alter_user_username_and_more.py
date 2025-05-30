# Generated by Django 5.2 on 2025-05-22 14:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('user', '0007_alter_useractivity_user'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={},
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=150, unique=True),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['username'], name='user_user_usernam_6d9439_idx'),
        ),
    ]
