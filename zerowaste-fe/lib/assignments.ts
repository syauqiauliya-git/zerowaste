import { apiFetch } from "./api";

export interface TeacherClassAssignment {
  _id: string;
  teacher_id: {
    _id: string;
    name: string;
    user_id?: {
      email: string;
    };
  };
  class_id: {
    _id: string;
    class_name: string;
    school_id?: {
      _id: string;
      school_name: string;
    };
  };
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateTeacherAssignmentDto {
  teacher_id: string;
  class_id: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface UpdateTeacherAssignmentDto {
  teacher_id?: string;
  class_id?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface SPPGSchoolAssignment {
  _id: string;
  sppg_id: {
    _id: string;
    name: string;
  };
  school_id: {
    _id: string;
    school_name: string;
    address?: string;
  };
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateSPPGAssignmentDto {
  sppg_id: string;
  school_id: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface UpdateSPPGAssignmentDto {
  sppg_id?: string;
  school_id?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export async function getAllTeacherAssignments() {
  const response = await apiFetch("/api/v1/assignments/teacher-class", {
    method: "GET",
  });
  return response as {
    status: string;
    results: number;
    data: { assignments: TeacherClassAssignment[] };
  };
}

export async function getTeacherAssignment(id: string) {
  const response = await apiFetch(`/api/v1/assignments/teacher-class/${id}`, {
    method: "GET",
  });
  return response as {
    status: string;
    data: { assignment: TeacherClassAssignment };
  };
}

export async function createTeacherAssignment(
  data: CreateTeacherAssignmentDto
) {
  const response = await apiFetch("/api/v1/assignments/teacher-class", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response as {
    status: string;
    data: { assignment: TeacherClassAssignment };
  };
}

export async function updateTeacherAssignment(
  id: string,
  data: UpdateTeacherAssignmentDto
) {
  const response = await apiFetch(`/api/v1/assignments/teacher-class/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response as {
    status: string;
    data: { assignment: TeacherClassAssignment };
  };
}

/**
 * Delete a teacher-class assignment
 */
export async function deleteTeacherAssignment(id: string) {
  const response = await apiFetch(`/api/v1/assignments/teacher-class/${id}`, {
    method: "DELETE",
  });
  return response as { status: string };
}

// ==================== SPPG-School Assignments ====================

/**
 * Get all SPPG-school assignments
 */
export async function getAllSPPGAssignments() {
  const response = await apiFetch("/api/v1/assignments/sppg-school", {
    method: "GET",
  });
  return response as {
    status: string;
    results: number;
    data: { assignments: SPPGSchoolAssignment[] };
  };
}

/**
 * Get a single SPPG-school assignment by ID
 */
export async function getSPPGAssignment(id: string) {
  const response = await apiFetch(`/api/v1/assignments/sppg-school/${id}`, {
    method: "GET",
  });
  return response as {
    status: string;
    data: { assignment: SPPGSchoolAssignment };
  };
}

/**
 * Create a new SPPG-school assignment
 */
export async function createSPPGAssignment(data: CreateSPPGAssignmentDto) {
  const response = await apiFetch("/api/v1/assignments/sppg-school", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response as {
    status: string;
    data: { assignment: SPPGSchoolAssignment };
  };
}

/**
 * Update a SPPG-school assignment
 */
export async function updateSPPGAssignment(
  id: string,
  data: UpdateSPPGAssignmentDto
) {
  const response = await apiFetch(`/api/v1/assignments/sppg-school/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response as {
    status: string;
    data: { assignment: SPPGSchoolAssignment };
  };
}

/**
 * Delete a SPPG-school assignment
 */
export async function deleteSPPGAssignment(id: string) {
  const response = await apiFetch(`/api/v1/assignments/sppg-school/${id}`, {
    method: "DELETE",
  });
  return response as { status: string };
}
