import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../core/services/http.service';
import { MedicalRecord } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-receptionist-patient-history',
  template: `
    <div class="history-container fade-in">
      <div class="dashboard-glow"></div>

      <div class="page-header fade-in mb-5">
        <div>
          <h1 class="page-title text-white">Patient Medical History</h1>
          <p class="page-subtitle text-muted-light">
            Viewing historical records for Patient ID: {{patientId}}
          </p>
        </div>

        <div style="display: flex; gap: 1rem;">
          <button class="btn-outline-light shadow-3d" (click)="goBack()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" class="me-2 inline-icon">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Appointments
          </button>
        </div>
      </div>

      <div class="history-list fade-in">
        <div *ngFor="let record of history; let i = index"
          class="glass-card history-card mb-4"
          [style.animation-delay]="(i * 0.1) + 's'">

          <div class="history-header border-bottom-dark pb-3 mb-4">
            <span class="record-date text-primary-light font-bold flex-align">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" class="me-2 inline-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{record.recordDate | date:'medium'}}
            </span>

            <div class="doctor-name text-white font-bold flex-align text-right">
              <div>
                Dr. {{record.doctor.name}}
                <span class="text-xs text-muted-light font-normal block">
                  {{record.doctor.specialty}}
                </span>
              </div>
            </div>
          </div>

          <div class="history-grid mb-4">
            <div class="history-item glass-panel">
              <label class="text-indigo-400">Symptoms</label>
              <p class="text-white mt-1">{{record.symptoms || '-'}}</p>
            </div>

            <div class="history-item glass-panel important-panel">
              <label class="text-indigo-400">Diagnosis</label>
              <p class="text-white font-bold mt-1">{{record.diagnosis || '-'}}</p>
            </div>
          </div>

          <div class="history-item glass-panel mb-4">
            <label class="text-indigo-400">Prescription</label>

            <div *ngIf="record.prescription && record.prescription.length > 0; else noPrescription"
              class="glass-table-wrap mt-2">
              <table class="glass-table w-full text-left">
                <tbody>
                  <tr *ngFor="let item of record.prescription"
                    class="border-b-dark hover-bg-dark">
                    <td class="p-3 font-bold text-white">{{item.medicationName}}</td>
                    <td class="p-3 text-muted-light">{{item.dosage}} ({{item.frequency}})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #noPrescription>
              <p class="text-muted-light mt-2 p-3 empty-box">No prescription recorded</p>
            </ng-template>
          </div>

          <div class="history-item glass-panel mb-4" *ngIf="record.notes">
            <label class="text-indigo-400">Notes</label>
            <p class="text-white mt-1">{{record.notes}}</p>
          </div>

          <div style="margin-top: 1rem; text-align: right;" class="pt-3 border-top-dark">
            <button class="btn-primary shadow-3d btn-sm"
              [routerLink]="['/print/prescription', record.id]">
              🖨️ Print Prescription
            </button>
          </div>
        </div>

        <div *ngIf="history.length === 0 && !isLoading"
          class="glass-card text-center py-5 no-history mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.5" class="mx-auto mb-3 opacity-30 text-muted-light">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p class="text-muted-light text-lg">No previous history found for this patient.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      padding: 2.5rem;
      min-height: 100vh;
      background: #0f172a;
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

    .page-header {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .page-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 0.25rem;
    }

    .page-subtitle {
      font-size: 1rem;
      margin: 0;
    }

    /* Glassmorphic Cards */
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 2rem;
      position: relative;
      z-index: 1;
      animation: slideUp 0.6s ease forwards;
    }

    .history-card {
      border-left: 5px solid #6366f1;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }

    .history-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px -10px rgba(0,0,0,0.5);
      border-color: #818cf8;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .history-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    /* Inner Panels */
    .glass-panel {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .important-panel {
      background: rgba(99, 102, 241, 0.05);
      border-color: rgba(99, 102, 241, 0.2);
    }

    .history-item label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    /* Glass Table */
    .glass-table { width: 100%; border-collapse: collapse; }
    .glass-table td { border-bottom: 1px solid rgba(255,255,255,0.05); }
    .glass-table tr:last-child td { border-bottom: none; }
    .hover-bg-dark:hover { background: rgba(255,255,255,0.03); }
    .empty-box {
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      border: 1px dashed rgba(255,255,255,0.1);
    }

    /* Buttons */
    .btn-outline-light {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }
    .btn-outline-light:hover {
      background: rgba(255,255,255,0.1);
      border-color: white;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
    }

    .btn-sm {
      padding: 0.45rem 0.9rem;
      font-size: 0.82rem;
      border-radius: 10px;
    }

    /* Utilities */
    .border-bottom-dark { border-bottom: 1px solid rgba(255,255,255,0.1); }
    .border-top-dark { border-top: 1px solid rgba(255,255,255,0.1); }
    .flex-align { display: flex; align-items: center; }
    .inline-icon { display: inline-block; margin-right: 6px; }
    .text-white { color: #ffffff; }
    .text-muted-light { color: #94a3b8; }
    .text-primary-light { color: #818cf8; }
    .text-indigo-400 { color: #818cf8; }
    .font-bold { font-weight: 700; }
    .font-normal { font-weight: 400; }
    .text-xs { font-size: 0.75rem; }
    .text-lg { font-size: 1.125rem; }
    .block { display: block; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-5 { margin-bottom: 2rem; }
    .pb-3 { padding-bottom: 1rem; }
    .pt-3 { padding-top: 1rem; }
    .p-3 { padding: 0.75rem; }
    .py-5 { padding-top: 3rem; padding-bottom: 3rem; }
    .w-full { width: 100%; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .opacity-30 { opacity: 0.3; }

    /* Animations */
    .fade-in { animation: fadeIn 0.4s ease both; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .history-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class ReceptionistPatientHistoryComponent implements OnInit {
  patientId!: number;
  history: MedicalRecord[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadHistory();
  }

  loadHistory(): void {
    this.http.getReceptionistPatientHistory(this.patientId).subscribe({
      next: (data) => {
        this.history = data.reverse();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/receptionist/appointments']);
  }
}