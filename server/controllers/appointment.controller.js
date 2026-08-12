const { Appointment, Slot, User, DoctorProfile } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/appointments
// Patient books a slot with a doctor
// ─────────────────────────────────────────────────────────────────────────────
exports.bookAppointment = async (req, res) => {
  try {
    const { slotId, visitType, reason, patientAddress } = req.body;

    // Step 1: Basic validation
    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'slotId is required',
      });
    }

    // Step 2: Find the slot and check it is still available
    const slot = await Slot.findOne({
      where: {
        id: slotId,
        isAvailable: true, // only available slots can be booked
      },
    });

    if (!slot) {
      return res.status(409).json({
        success: false,
        // 409 Conflict — the slot is already taken
        message: 'This slot is no longer available. Please choose another slot.',
      });
    }

    // Step 3: Home visit needs a patient address
    if (visitType === 'home' && !patientAddress) {
      return res.status(400).json({
        success: false,
        message: 'Patient address is required for home visits',
      });
    }

    // Step 4: LOCK THE SLOT immediately
    // This is critical — set isAvailable = false right away
    // so no other patient can book the same slot
    await slot.update({ isAvailable: false });

    // Step 5: Create the appointment record
    const appointment = await Appointment.create({
      patientId: req.user.userId,     // who is booking
      doctorId: slot.doctorId,        // which doctor (from the slot)
      slotId: slot.id,                // which time slot
      visitType: visitType || slot.visitType, // use slot's default if not specified
      status: 'pending',              // starts as pending, doctor must confirm
      reason: reason || null,
      patientAddress: patientAddress || null,
    });

    // Step 6: Fetch the full appointment with doctor details to return
    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Slot,
          as: 'slot',
          attributes: ['date', 'startTime', 'endTime', 'visitType'],
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! Waiting for doctor confirmation.',
      data: fullAppointment,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/mine
// Patient sees all their own appointments
// Optional filter: ?status=pending or ?status=completed
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = { patientId: req.user.userId };
    if (status) whereClause.status = status;

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Slot,
          as: 'slot',
          attributes: ['date', 'startTime', 'endTime', 'visitType'],
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          include: [
            {
              association: 'doctorProfile',
              attributes: ['specialization', 'consultationFee', 'profilePhoto'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']], // newest first
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/doctor
// Doctor sees all appointments booked with them
// Optional filter: ?status=pending or ?date=2026-08-15
// ─────────────────────────────────────────────────────────────────────────────
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = { doctorId: req.user.userId };
    if (status) whereClause.status = status;

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Slot,
          as: 'slot',
          attributes: ['date', 'startTime', 'endTime', 'visitType'],
        },
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/:id
// Get a single appointment's full details
// Both patient and doctor can view their own appointments
// ─────────────────────────────────────────────────────────────────────────────
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Slot,
          as: 'slot',
          attributes: ['date', 'startTime', 'endTime', 'visitType'],
        },
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          include: [
            {
              association: 'doctorProfile',
              attributes: ['specialization', 'consultationFee', 'clinicAddress'],
            },
          ],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Security check: only the patient or doctor involved can view this
    const isPatient = appointment.patientId === req.user.userId;
    const isDoctor = appointment.doctorId === req.user.userId;
    const isAdmin = req.user.role === 'super_admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this appointment',
      });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/appointments/:id/status
// Update appointment status
//
// Doctor can:  pending → confirmed
//              confirmed → completed (after visit)
//              pending/confirmed → cancelled
//
// Patient can: pending → cancelled (before doctor confirms)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notesByDoctor, cancellationReason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    // Find the appointment with its slot
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: Slot, as: 'slot' }],
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isDoctor = appointment.doctorId === req.user.userId;
    const isPatient = appointment.patientId === req.user.userId;

    // ── DOCTOR ACTIONS ──────────────────────────────────────────────────────
    if (isDoctor) {
      // Doctor can confirm a pending appointment
      if (status === 'confirmed' && appointment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Can only confirm a pending appointment',
        });
      }

      // Doctor can mark as completed (after the visit is done)
      if (status === 'completed' && appointment.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Can only complete a confirmed appointment',
        });
      }

      const updates = { status };

      // Doctor can add notes when completing the appointment
      // These notes become the patient's medical history
      if (notesByDoctor) updates.notesByDoctor = notesByDoctor;

      if (status === 'cancelled') {
        updates.cancelledBy = 'doctor';
        updates.cancellationReason = cancellationReason || 'Cancelled by doctor';
        // FREE the slot so another patient can book it
        await appointment.slot.update({ isAvailable: true });
      }

      await appointment.update(updates);
    }

    // ── PATIENT ACTIONS ─────────────────────────────────────────────────────
    else if (isPatient) {
      // Patient can only cancel (not confirm or complete)
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Patients can only cancel appointments',
        });
      }

      // Patient can only cancel if appointment is still pending
      if (appointment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'You can only cancel a pending appointment',
        });
      }

      await appointment.update({
        status: 'cancelled',
        cancelledBy: 'patient',
        cancellationReason: cancellationReason || 'Cancelled by patient',
      });

      // FREE the slot so another patient can book it
      await appointment.slot.update({ isAvailable: true });
    }

    // ── UNAUTHORIZED ────────────────────────────────────────────────────────
    else {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this appointment',
      });
    }

    // Fetch updated appointment to return
    const updated = await Appointment.findByPk(req.params.id, {
      include: [{ model: Slot, as: 'slot' }],
    });

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
