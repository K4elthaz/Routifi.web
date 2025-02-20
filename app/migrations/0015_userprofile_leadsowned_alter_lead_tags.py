# Generated by Django 5.1.5 on 2025-02-10 07:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0014_leadsinqueue_alter_membership_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='LeadsOwned',
            field=models.ManyToManyField(to='app.lead'),
        ),
        migrations.AlterField(
            model_name='lead',
            name='tags',
            field=models.JSONField(default=list),
        ),
    ]
