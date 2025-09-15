import jsPDF from "jspdf";

export function generateStudentPdf(student: any) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Student Details", 10, 10);
  doc.setFontSize(12);
  let y = 20;
  const addLine = (label: string, value: any) => {
    doc.text(`${label}: ${value ?? ""}`, 10, y);
    y += 8;
  };
  addLine("Student ID", student.studentId);
  addLine("Full Name", student.fullName);
  addLine("Permanent Address", student.permanentAddress);
  addLine("District", student.district);
  addLine("Province", student.province);
  addLine("Date of Birth", student.dateOfBirth);
  addLine("National ID", student.nationalId);
  addLine("Passport ID", student.passportId);
  addLine("Passport Expiry", student.passportExpiredDate);
  addLine("Sex", student.sex);
  addLine("Marital Status", student.maritalStatus);
  addLine("Spouse Name", student.spouseName);
  addLine("Number of Children", student.numberOfChildren);
  addLine("Mobile Phone", student.mobilePhone);
  addLine("Whatsapp Number", student.whatsappNumber);
  addLine("Has Driving License", student.hasDrivingLicense ? "Yes" : "No");
  addLine("Vehicle Type", student.vehicleType);
  addLine("Email Address", student.emailAddress);
  addLine("Education O/L", student.educationOL ? "Yes" : "No");
  addLine("Education A/L", student.educationAL ? "Yes" : "No");
  addLine("Other Qualifications", student.otherQualifications);
  addLine("Work Experience", student.workExperience);
  addLine("Work Experience Abroad", student.workExperienceAbroad);
  addLine("CV Photo URL", student.cvPhotoUrl);
  addLine("Status", student.status);
  addLine("Guardian Name", student.guardianName);
  addLine("Guardian Contact", student.guardianContact);
  addLine("Expected Job Category", student.expectedJobCategory);
  return doc;
}