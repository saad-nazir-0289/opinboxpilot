export function serializeStudentForClient(studentDoc) {
  if (!studentDoc) return null;

  const student = typeof studentDoc.toObject === 'function'
    ? studentDoc.toObject()
    : { ...studentDoc };

  delete student.password;
  delete student.googleAccessToken;
  delete student.googleRefreshToken;

  return student;
}
