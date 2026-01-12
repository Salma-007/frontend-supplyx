
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '../../services/user.service';
import { Role, RoleUtils } from '../../role/role';
import { RoleBadgeComponent } from '../../shared/components/role-badge/role-badge.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RoleBadgeComponent
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  isEditMode = false;
  userId?: number;
  errorMessage = '';
  successMessage = '';
  loading = false;

  // Données pour les selects
  availableRoles = RoleUtils.getRolesForSelect();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialise le formulaire avec les validations
   */
  private initForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ], [this.emailExistsValidator.bind(this)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required],
      role: [Role.GESTIONNAIRE_APPROVISIONNEMENT, Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Vérifie si on est en mode édition
   */
  private checkEditMode(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.userId = +params['id'];
          this.loadUser();

          // En mode édition, le mot de passe n'est pas obligatoire
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.setValidators([
            Validators.minLength(8),
            this.passwordStrengthValidator
          ]);
          this.userForm.get('confirmPassword')?.clearValidators();
          this.userForm.updateValueAndValidity();
        }
      });
  }

  /**
   * Charge les données de l'utilisateur en mode édition
   */
  private loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.getUserById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.userForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          });
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Validateur personnalisé : vérifier la force du mot de passe
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return passwordValid ? null : { weakPassword: true };
  }

  /**
   * Validateur personnalisé : vérifier que les mots de passe correspondent
   */
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Validateur asynchrone : vérifier si l'email existe déjà
   */
  private emailExistsValidator(control: AbstractControl): Promise<ValidationErrors | null> {
    if (!control.value) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      this.userService.emailExists(control.value, this.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (exists) => {
            resolve(exists ? { emailExists: true } : null);
          },
          error: () => {
            resolve(null);
          }
        });
    });
  }

  get roleControl(): AbstractControl {
    return this.userForm.get('role')!;
  }


  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire';
      return;
    }

    const formValue = this.userForm.value;
    const userData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password || 'unchanged', // En édition, mot de passe optionnel
      role: formValue.role
    };

    this.loading = true;
    this.errorMessage = '';

    const operation = this.isEditMode && this.userId
      ? this.userService.updateUser(this.userId, userData)
      : this.userService.createUser(userData);

    operation
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = this.isEditMode
            ? 'Utilisateur modifié avec succès'
            : 'Utilisateur créé avec succès';
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/users']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Marque tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Annule et retourne à la liste
   */
  cancel(): void {
    this.router.navigate(['/users']);
  }

  /**
   * Obtient les informations d'un rôle
   */
  getRoleInfo(role: Role) {
    return RoleUtils.getRoleInfo(role);
  }

  /**
   * Getters pour accéder facilement aux contrôles
   */
  get firstName() { return this.userForm.get('firstName'); }
  get lastName() { return this.userForm.get('lastName'); }
  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
  get confirmPassword() { return this.userForm.get('confirmPassword'); }
  get role() { return this.userForm.get('role'); }

  /**
   * Vérifie si un champ a une erreur spécifique
   */
  hasError(controlName: string, errorName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control?.hasError(errorName) && control?.touched);
  }

  /**
   * Vérifie si le formulaire a une erreur globale
   */
  hasFormError(errorName: string): boolean {
    return !!(this.userForm.hasError(errorName) && this.userForm.touched);
  }
}
