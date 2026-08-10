const { Slot, DoctorProfile } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/slots
// Only a VERIFIED doctor can create slots
// ─────────────────────────────────────────────────────────────────────────────
exports.createSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, visitType } = req.body;

    // Step 1: Check all required fields are provided
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, startTime, and endTime are required',
      });
    }

    // Step 2: Check that this doctor's profile is verified
    // Only verified doctors can create slots and appear in listings
    const profile = await DoctorProfile.findOne({
      where: {
        userId: req.user.userId,
        verificationStatus: 'verified',
      },
    });

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: 'Only verified doctors can create slots. Please wait for admin approval.',
      });
    }

    // Step 3: Prevent duplicate slots
    // A doctor should not have two slots at the same date and time
    const existingSlot = await Slot.findOne({
      where: {
        doctorId: req.user.userId,
        date,
        startTime,
      },
    });

    if (existingSlot) {
      return res.status(409).json({
        success: false,
        message: 'You already have a slot at this date and time',
      });
    }

    // Step 4: Create the slot
    const slot = await Slot.create({
      doctorId: req.user.userId,
      date,
      startTime,
      endTime,
      visitType: visitType || 'clinic',
      isAvailable: true, // available by default when created
    });

    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: slot,
    });
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating slot',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/slots/bulk
// Doctor creates MULTIPLE slots at once
// Example: "I'm available every day this week from 9am to 1pm"
// ─────────────────────────────────────────────────────────────────────────────
exports.createBulkSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    // slots = array like: [{ date, startTime, endTime, visitType }, ...]

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of slots',
      });
    }

    // Check doctor is verified
    const profile = await DoctorProfile.findOne({
      where: {
        userId: req.user.userId,
        verificationStatus: 'verified',
      },
    });

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: 'Only verified doctors can create slots',
      });
    }

    // Add doctorId and isAvailable to every slot in the array
    const slotsToCreate = slots.map((slot) => ({
      ...slot,
      doctorId: req.user.userId,
      isAvailable: true,
    }));

    // bulkCreate inserts all records in one DB query (fast!)
    // ignoreDuplicates: true means skip if same slot already exists (no error)
    const created = await Slot.bulkCreate(slotsToCreate, {
      ignoreDuplicates: true,
    });

    res.status(201).json({
      success: true,
      message: `${created.length} slot(s) created successfully`,
      data: created,
    });
  } catch (error) {
    console.error('Bulk create slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating slots',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/slots/my-slots
// Doctor sees their own slots (all of them)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMySlots = async (req, res) => {
  try {
    const { date } = req.query;
    // Optional: filter by date → /api/slots/my-slots?date=2026-08-15

    const whereClause = { doctorId: req.user.userId };
    if (date) whereClause.date = date;

    const slots = await Slot.findAll({
      where: whereClause,
      order: [
        ['date', 'ASC'],      // sort by date first
        ['startTime', 'ASC'], // then by time
      ],
    });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    console.error('Get my slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/slots/doctor/:doctorId
// Customers use this to see available slots of a specific doctor
// Only returns isAvailable: true slots
// ─────────────────────────────────────────────────────────────────────────────
exports.getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    // Optional: filter by date → /api/slots/doctor/:id?date=2026-08-15

    const whereClause = {
      doctorId,
      isAvailable: true, // only show available (unbooked) slots to customers
    };

    if (date) whereClause.date = date;

    const slots = await Slot.findAll({
      where: whereClause,
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC'],
      ],
    });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    console.error('Get doctor slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/slots/:id
// Doctor deletes one of their slots (only if it hasn't been booked yet)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteSlot = async (req, res) => {
  try {
    // Find the slot — must belong to this doctor
    const slot = await Slot.findOne({
      where: {
        id: req.params.id,
        doctorId: req.user.userId, // doctor can only delete their OWN slots
      },
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    // Cannot delete a slot that is already booked by a patient
    if (!slot.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a slot that is already booked by a patient',
      });
    }

    await slot.destroy(); // delete from database

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully',
    });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
