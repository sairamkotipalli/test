import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../core/services/http.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-doctor-add-record',
  template: `
    <div class="history-container fade-in">
      <div class="dashboard-glow"></div>

      <div class="page-header mb-5">
        <div>
          <h1 class="page-title text-white">Add Medical Record</h1>
          <p class="page-subtitle text-muted-light">Patient: <span class="text-primary-light font-bold">{{patientName}}</span></p>
        </div>
      </div>

      <div class="glass-card fade-in">
        <form [formGroup]="recordForm" (ngSubmit)="onSubmit()">
          
          <div class="form-grid mb-4">
            <div class="form-group">
              <label class="text-indigo-400">Age</label>
              <input type="number" formControlName="age" class="form-control glass-input">
            </div>
            <div class="form-group">
              <label class="text-indigo-400">Weight (kg)</label>
              <input type="number" formControlName="weight" class="form-control glass-input">
            </div>
            <div class="form-group">
              <label class="text-indigo-400">Height (cm)</label>
              <input type="number" formControlName="height" class="form-control glass-input">
            </div>
            <div class="form-group">
              <label class="text-indigo-400">Blood Pressure</label>
              <input type="text" formControlName="bp" class="form-control glass-input" placeholder="e.g. 120/80">
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="text-indigo-400">Allergies</label>
            <input type="text" formControlName="allergies" class="form-control glass-input" placeholder="Any known allergies (Penicillin, Peanuts, etc.)">
          </div>

          <div class="form-group mb-4">
            <label class="text-indigo-400">Symptoms <span class="text-danger">*</span></label>
            <textarea formControlName="symptoms" class="form-control glass-input" rows="3" placeholder="Describe patient symptoms..."></textarea>
          </div>

          <div class="form-group mb-4">
            <label class="text-indigo-400">Diagnosis <span class="text-danger">*</span></label>
            <textarea formControlName="diagnosis" class="form-control glass-input" rows="3" placeholder="Enter formal diagnosis..."></textarea>
          </div>

          <div class="prescription-section glass-panel mb-4">
            <div class="flex-align justify-between mb-4 border-bottom-dark pb-3">
              <label class="text-white text-lg font-bold mb-0">Medication Prescription</label>
              <button type="button" class="btn-outline-primary shadow-3d" (click)="addPrescriptionItem()">+ Add Medication</button>
            </div>
            
            <div formArrayName="prescription">
              <div class="prescription-item glass-panel-inner" *ngFor="let item of prescription.controls; let i=index" [formGroupName]="i">
                
                <div class="flex-align justify-between border-bottom-dark pb-2 mb-3">
                  <span class="text-primary-light font-bold">Medication #{{i + 1}}</span>
                  <button *ngIf="prescription.length > 1" type="button" class="btn-sm btn-text-danger" (click)="removePrescriptionItem(i)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Remove
                  </button>
                </div>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label class="text-muted-light">Name</label>
                    <input type="text" formControlName="medicationName" class="form-control glass-input" placeholder="e.g. Amoxicillin">
                  </div>
                  <div class="form-group">
                    <label class="text-muted-light">Dosage</label>
                    <input type="text" formControlName="dosage" class="form-control glass-input" placeholder="e.g. 500mg">
                  </div>
                  <div class="form-group">
                    <label class="text-muted-light">Frequency</label>
                    <input type="text" formControlName="frequency" class="form-control glass-input" placeholder="e.g. Twice Daily">
                  </div>
                  <div class="form-group">
                    <label class="text-muted-light">Route</label>
                    <input type="text" formControlName="route" class="form-control glass-input" placeholder="e.g. Oral">
                  </div>
                  <div class="form-group col-span-full">
                    <label class="text-muted-light">Purpose</label>
                    <input type="text" formControlName="purpose" class="form-control glass-input" placeholder="e.g. Infection">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="text-indigo-400">Additional Notes</label>
            <textarea formControlName="notes" class="form-control glass-input" rows="2" placeholder="Any extra instructions for the patient..."></textarea>
          </div>

          <div class="form-actions mt-5 pt-4 border-top-dark">
            <button type="button" class="btn-outline-light" (click)="goBack()">Cancel</button>
            <button type="submit" class="btn-primary shadow-3d" [disabled]="recordForm.invalid || isLoading">
              <span *ngIf="isLoading" class="btn-spinner"></span>
              {{isLoading ? 'Saving...' : 'Save Record'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      padding: 2.5rem;
      min-height: 100vh;
      background: #0f172a; /* Deep Navy Theme */
      position: relative;
      overflow: hidden;
    }

    .dashboard-glow {
      position: absolute;
      top: -10%; right: -10%;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      filter: blur(80px);
      z-index: 0;
    }

    .page-header { position: relative; z-index: 1; }
    .page-title { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 0.25rem; }

    /* Glass Cards & Panels */
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 2.5rem;
      position: relative;
      z-index: 1;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .glass-panel-inner {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    .glass-panel-inner:last-child { margin-bottom: 0; }

    /* Grid Layouts */
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
    .col-span-full { grid-column: 1 / -1; }

    /* Typography & Labels */
    .form-group label { display: block; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 0.5rem; }
    .text-indigo-400 { color: #818cf8; }
    .text-primary-light { color: #a5b4fc; }
    .text-white { color: #ffffff; }
    .text-muted-light { color: #94a3b8; }
    .text-danger { color: #f87171; }
    .font-bold { font-weight: 700; }
    .text-lg { font-size: 1.125rem; }

    /* Glass Inputs */
    .glass-input {
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: white !important;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      width: 100%;
      font-size: 0.95rem;
      transition: all 0.3s;
    }
    .glass-input::placeholder { color: rgba(255, 255, 255, 0.3); }
    .glass-input:focus {
      outline: none;
      border-color: #6366f1 !important;
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
    }

    /* Buttons */
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center;
      background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s;
    }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-outline-light {
      display: inline-flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s;
    }
    .btn-outline-light:hover { background: rgba(255,255,255,0.1); border-color: white; }

    .btn-outline-primary {
      display: inline-flex; align-items: center; justify-content: center;
      background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; color: #a5b4fc; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.3s;
    }
    .btn-outline-primary:hover { background: rgba(99, 102, 241, 0.2); color: white; }

    .btn-text-danger {
      background: transparent; border: none; color: #f87171; cursor: pointer; display: flex; align-items: center; font-size: 0.85rem; font-weight: 600; transition: color 0.2s; padding: 0;
    }
    .btn-text-danger:hover { color: #ef4444; }

    /* Utilities */
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; }
    .border-bottom-dark { border-bottom: 1px solid rgba(255,255,255,0.1); }
    .border-top-dark { border-top: 1px solid rgba(255,255,255,0.1); }
    .flex-align { display: flex; align-items: center; }
    .justify-between { justify-content: space-between; }
    .inline-icon { display: inline-block; margin-right: 4px; }
    .mb-0 { margin-bottom: 0; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mb-5 { margin-bottom: 2.5rem; }
    .mt-5 { margin-top: 2rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .pb-3 { padding-bottom: 0.75rem; }
    .pt-4 { padding-top: 1.5rem; }

    .btn-spinner {
      display: inline-block; width: 16px; height: 16px; margin-right: 8px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DoctorAddRecordComponent implements OnInit {
  recordForm!: FormGroup;
  appointmentId!: number;
  patientName!: string;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.patientName = this.route.snapshot.queryParamMap.get('patientName') ?? 'Unknown Patient';
    
    this.recordForm = this.fb.group({
      age: [null],
      weight: [null],
      height: [null],
      bp: [''],
      allergies: [''],
      symptoms: ['', Validators.required],
      diagnosis: ['', Validators.required],
      prescription: this.fb.array([
        this.createPrescriptionItem()
      ]),
      notes: ['']
    });
  }

  get prescription(): FormArray {
    return this.recordForm.get('prescription') as FormArray;
  }

  createPrescriptionItem(): FormGroup {
    return this.fb.group({
      medicationName: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      route: ['', Validators.required],
      purpose: ['', Validators.required]
    });
  }

  addPrescriptionItem(): void {
    this.prescription.push(this.createPrescriptionItem());
  }

  removePrescriptionItem(index: number): void {
    if (this.prescription.length > 1) {
      this.prescription.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.http.addMedicalRecord(this.appointmentId, this.recordForm.value).subscribe({
      next: () => {
        this.alert.success('Medical record added successfully');
        this.router.navigate(['/doctor/appointments']);
      },
      error: () => { this.isLoading = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/doctor/appointments']);
  }
}
