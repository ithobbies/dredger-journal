# Generated by Django 4.2.9 on 2025-05-16 10:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('refdata', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ComponentInstance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('serial_number', models.CharField(blank=True, max_length=120)),
                ('total_hours', models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Dredger',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('inv_number', models.CharField(max_length=50, unique=True, verbose_name='Хоз. номер')),
                ('type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='refdata.dredgertype')),
            ],
        ),
        migrations.CreateModel(
            name='Repair',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('notes', models.TextField(blank=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created', to=settings.AUTH_USER_MODEL)),
                ('dredger', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repairs', to='repairs.dredger')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-created_at',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='RepairItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hours', models.PositiveIntegerField()),
                ('note', models.CharField(blank=True, max_length=255)),
                ('component', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='repairs.componentinstance')),
                ('repair', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='repairs.repair')),
            ],
        ),
        migrations.AddField(
            model_name='componentinstance',
            name='current_dredger',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='components', to='repairs.dredger'),
        ),
        migrations.AddField(
            model_name='componentinstance',
            name='part',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='refdata.sparepart'),
        ),
    ]
