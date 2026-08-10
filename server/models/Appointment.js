module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define(
    'Appointment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      slotId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // one appointment per slot max
      },
      visitType: {
        type: DataTypes.ENUM('clinic', 'home', 'online'),
        defaultValue: 'clinic',
      },
      status: {
        // pending   = booked, waiting for doctor to confirm
        // confirmed = doctor accepted
        // completed = visit done
        // cancelled = either party cancelled
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      reason: {
        // Patient's reason for visit / symptoms
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notesByDoctor: {
        // Doctor writes diagnosis/notes after visit — becomes patient history
        type: DataTypes.TEXT,
        allowNull: true,
      },
      patientAddress: {
        // Required for home visits
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cancelledBy: {
        type: DataTypes.STRING, // 'patient', 'doctor', or 'admin'
        allowNull: true,
      },
      cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return Appointment;
};
