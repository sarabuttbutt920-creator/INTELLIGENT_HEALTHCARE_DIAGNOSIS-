import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

// Helper to handle BigInt serialization
const serialize = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

export async function GET(request: Request) {
    try {
        const user = await getUserSession();

        if (!user || user.role !== 'DOCTOR' || !user.doctor) {
            return NextResponse.json({ success: false, message: 'Unauthorized. Doctor access required.' }, { status: 401 });
        }

        // 1. Fetch appointments where this doctor is involved, to determine their active patient list.
        const doctorAppointments = await prisma.appointment.findMany({
            where: { doctor_id: user.doctor.doctor_id },
            include: {
                patient: {
                    include: {
                        user: true,
                        encounters: {
                            orderBy: { encounter_date: 'desc' },
                            take: 1, // latest encounter
                            include: { predictions: true, labResult: true }
                        }
                    }
                }
            },
            orderBy: { scheduled_start: 'desc' }, // most recent interactions
        });

        // 2. Deduplicate patients
        const patientMap = new Map();
        
        doctorAppointments.forEach(apt => {
            const pt = apt.patient;
            if (!pt) return;
            const ptId = pt.patient_id.toString();

            if (!patientMap.has(ptId)) {
                // Determine risk level based on latest prediction or lab result
                let riskStatus = "HEALTHY";
                let primaryCondition = "General Checkup";
                let recentPredictionId = null;
                let lastVisit = apt.scheduled_start; // Last known interaction

                const latestEncounter = pt.encounters && pt.encounters.length > 0 ? pt.encounters[0] : null;

                if (latestEncounter) {
                    if (latestEncounter.predictions && latestEncounter.predictions.length > 0) {
                        const pred = latestEncounter.predictions[0];
                        recentPredictionId = pred.prediction_id.toString();
                        
                        if (pred.predicted_label === 'CKD') {
                            riskStatus = "HIGH_RISK";
                            primaryCondition = "Chronic Kidney Disease Detect";
                        } else if (pred.predicted_label === 'NOT_CKD') {
                            riskStatus = "HEALTHY";
                            primaryCondition = "Normal Kidney Function";
                        } else {
                            riskStatus = "MODERATE";
                            primaryCondition = "Inconclusive Eval";
                        }
                    } else if (latestEncounter.labResult) {
                        // If lab results exists but no prediction, mark as pending evaluation
                        riskStatus = "PENDING_SCAN";
                        primaryCondition = "Awaiting AI Triaging";
                    }
                }

                // Identify if next appointment is in the future
                let nextAppointment = null;
                if (apt.scheduled_start > new Date() && (apt.status === "REQUESTED" || apt.status === "CONFIRMED")) {
                     nextAppointment = apt.scheduled_start;
                }

                patientMap.set(ptId, {
                    id: `PAT-${ptId}`, // Formatted ID
                    fullName: pt.user.full_name || "Unknown Patient",
                    avatar: (pt.user.full_name || "Pt").substring(0, 2).toUpperCase(),
                    age: pt.date_of_birth ? new Date().getFullYear() - new Date(pt.date_of_birth).getFullYear() : 45,
                    gender: pt.gender === 'MALE' ? 'Male' : pt.gender === 'FEMALE' ? 'Female' : 'Other',
                    bloodType: pt.blood_group || "Unknown",
                    phone: pt.user.phone || "N/A",
                    email: pt.user.email,
                    lastVisit: lastVisit, 
                    nextAppointment: nextAppointment, 
                    riskStatus: riskStatus,
                    recentPredictionId: recentPredictionId,
                    primaryCondition: primaryCondition
                });
            } else {
                // If we already have the patient, just update nextAppointment if applicable
                const existing = patientMap.get(ptId);
                if (apt.scheduled_start > new Date() && apt.scheduled_start < (existing.nextAppointment || new Date('2100-01-01')) && (apt.status === "REQUESTED" || apt.status === "CONFIRMED")) {
                    existing.nextAppointment = apt.scheduled_start;
                }
            }
        });

        // 3. To make it demo-friendly if the doctor has 0 appointments
        let finalPatients = Array.from(patientMap.values());
        
        if (finalPatients.length === 0) {
            // Fetch some random patients just to populate the dashboard for demo
            const anyPatients = await prisma.patient.findMany({
                take: 5,
                include: { user: true, encounters: { take: 1, orderBy: { encounter_date: 'desc' }, include: { predictions: true } } }
            });

            finalPatients = anyPatients.map(pt => {
                let riskStatus = "HEALTHY";
                let primaryCondition = "General Setup";
                if (pt.encounters && pt.encounters.length > 0) {
                     const enc = pt.encounters[0];
                     if (enc.predictions && enc.predictions.length > 0) {
                         const lbl = enc.predictions[0].predicted_label;
                         if (lbl === 'CKD') { riskStatus = "HIGH_RISK"; primaryCondition = "CKD Detection"; }
                         else { riskStatus = "HEALTHY"; primaryCondition = "Routine checkup"; }
                     } else {
                         riskStatus = "PENDING_SCAN";
                     }
                } else {
                    riskStatus = "PENDING_SCAN";
                }
                
                return {
                    id: `PAT-${pt.patient_id}`,
                    fullName: pt.user.full_name,
                    avatar: pt.user.full_name.substring(0,2).toUpperCase(),
                    age: pt.date_of_birth ? new Date().getFullYear() - new Date(pt.date_of_birth).getFullYear() : 38,
                    gender: pt.gender === 'MALE' ? 'Male' : 'Female',
                    bloodType: pt.blood_group || "O+",
                    phone: pt.user.phone || "Unknown",
                    email: pt.user.email,
                    lastVisit: pt.created_at,
                    nextAppointment: null,
                    riskStatus,
                    primaryCondition
                };
            });
        }

        return NextResponse.json(serialize({ success: true, patients: finalPatients }));

    } catch (error: any) {
        console.error('Error fetching patients:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
