# Generated by Django 3.1.4 on 2021-04-22 02:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calendarApp', '0002_auto_20210420_2136'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='address',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='event',
            name='geolocation',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
