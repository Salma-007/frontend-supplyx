import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {CustomerService} from '../../../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-form.component.html'
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  customerId?: number;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.customerId = +id;
      this.customerService.getById(this.customerId).subscribe(data => {
        this.customerForm.patchValue(data);
      });
    }
  }

  onSubmit(): void {
    if (this.customerForm.invalid) return;

    const request = this.customerForm.value;
    const action = this.isEditMode
      ? this.customerService.update(this.customerId!, request)
      : this.customerService.create(request);

    action.subscribe(() => this.router.navigate(['/customers']));
  }
}
