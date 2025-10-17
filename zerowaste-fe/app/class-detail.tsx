import { getRole } from "@/lib/auth-storage";
import { Class, fetchClassDetail } from "@/lib/class";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

function ClassDetail() {
  const { classId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.classes);
  const [classDetail, setClassDetail] = useState<Class | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    class_name: "",
    grade_level: "",
  });

  const fetchClassDetailData = async () => {
    try {
      const classData = await fetchClassDetail(classId as string);
      console.log("Class detail response:", classData);
      setClassDetail(classData);
      setEditData({
        class_name: classData.class_name || "",
        grade_level: classData.grade_level || "",
      });
    } catch (error) {
      console.error("Failed to fetch class detail:", error);
    }
  };

  useEffect(() => {
    fetchClassDetailData();
    getRole().then((role) => {
      console.log("Role:", role);
      setRole(role);
    });
  }, [classId]);

  return <div>ClassDetail</div>;
}

export default ClassDetail;
