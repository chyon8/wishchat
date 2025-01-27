import React from "react";

// 삭제 가능한 필드들의 타입
type RemovableField = "requirements" | "features" | "workRange";

// 항목 삭제 핸들러 훅
const useItemRemoval = (
  registrationData: RegistrationData,
  setRegistrationData: React.Dispatch<React.SetStateAction<RegistrationData>>
) => {
  const handleRemove = React.useCallback(
    (field: RemovableField, index: number) => {
      setRegistrationData((prev) => ({
        ...prev,
        projectData: {
          ...prev.projectData,
          [field]: prev.projectData[field].filter((_, i) => i !== index),
        },
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleAdd = React.useCallback((field: RemovableField) => {
    setRegistrationData((prev) => ({
      ...prev,
      projectData: {
        ...prev.projectData,
        [field]: [...prev.projectData[field], ""],
      },
    }));
  }, []);

  return { handleRemove, handleAdd };
};

export default useItemRemoval;
