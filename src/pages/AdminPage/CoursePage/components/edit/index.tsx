import CourseForm from '../course-form';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || '0');

  const handleSuccess = () => {
    navigate('/admin/courses');
  };

  const handleCancel = () => {
    navigate('/admin/courses');
  };

  return (
    <CourseForm
      courseId={courseId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}