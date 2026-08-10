module.exports = (sequelize, DataTypes) => {
  const Slot = sequelize.define(
    'Slot',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY, // "2026-08-15" (no time)
        allowNull: false,
      },
      startTime: {
        type: DataTypes.TIME, // "10:00:00"
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME, // "10:30:00"
        allowNull: false,
      },
      visitType: {
        type: DataTypes.ENUM('clinic', 'home', 'online'),
        defaultValue: 'clinic',
      },
      isAvailable: {
        // When a patient books this slot, set isAvailable = false
        // This prevents any other patient from booking the same time
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return Slot;
};
