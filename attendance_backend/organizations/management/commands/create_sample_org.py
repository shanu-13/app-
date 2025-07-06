from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from organizations.models import Organization, OrganizationAdmin

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a sample organization for testing'

    def handle(self, *args, **options):
        # Create sample organization
        org, created = Organization.objects.get_or_create(
            email='demo@company.com',
            defaults={
                'name': 'Demo Company Ltd.',
                'phone': '+1-555-0123',
                'address': '123 Business Street, Corporate City, CC 12345',
                'website': 'https://democompany.com'
            }
        )
        
        if created:
            self.stdout.write(f'Created organization: {org.name}')
        else:
            self.stdout.write(f'Organization already exists: {org.name}')
        
        # Create admin user for the organization
        admin_user, user_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@democompany.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'organization': org
            }
        )
        
        if user_created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Created admin user: {admin_user.username}')
        else:
            self.stdout.write(f'Admin user already exists: {admin_user.username}')
        
        # Create organization admin relationship
        org_admin, rel_created = OrganizationAdmin.objects.get_or_create(
            organization=org,
            user=admin_user
        )
        
        if rel_created:
            self.stdout.write('Created organization admin relationship')
        
        # Create sample employee
        employee, emp_created = User.objects.get_or_create(
            username='employee1',
            defaults={
                'email': 'employee1@democompany.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'employee',
                'employee_id': 'EMP001',
                'designation': 'Software Developer',
                'project': 'Web Development',
                'organization': org
            }
        )
        
        if emp_created:
            employee.set_password('employee123')
            employee.save()
            self.stdout.write(f'Created employee: {employee.username}')
        else:
            self.stdout.write(f'Employee already exists: {employee.username}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSample organization setup complete!\n'
                f'Organization: {org.name}\n'
                f'Admin Login: admin / admin123\n'
                f'Employee Login: employee1 / employee123'
            )
        )