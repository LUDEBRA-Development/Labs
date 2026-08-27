import { Navigate, Route, Routes } from "react-router-dom";
import { EvaluateDeliveryPage } from "./teacher/EvaluateDeliveryPage";
import { TaskDeliveriesPage } from "./teacher/TaskDeliveriesPage";
import { TeacherActivitiesPage } from "./teacher/TeacherActivitiesPage";

export function TeacherEvaluationPage() {
  return (
    <Routes>
      <Route element={<Navigate replace to="actividades" />} index />
      <Route element={<TeacherActivitiesPage />} path="actividades" />
      <Route
        element={<TaskDeliveriesPage />}
        path="actividades/:idTask/entregas"
      />
      <Route
        element={<EvaluateDeliveryPage />}
        path="actividades/:idTask/entregas/:emailUser"
      />
      <Route element={<Navigate replace to="actividades" />} path="*" />
    </Routes>
  );
}
