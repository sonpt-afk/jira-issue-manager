import { requestJira, view } from "@forge/bridge";

// Lấy App ID một cách an toàn mỗi khi cần, không cache
const getAppId = async () => {
  const context = await view.getContext();
  return context.app.id;
};

export const getAppProperty = async (propertyKey) => {
  const appId = await getAppId();
  const response = await requestJira(
    `/rest/api/3/addons/${appId}/properties/${propertyKey}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Thuộc tính chưa được set, đây là trạng thái hợp lệ
    }
    // Ném lỗi để component có thể bắt và xử lý
    const errorText = await response.text();
    throw new Error(`Failed to get app property: ${errorText}`);
  }

  return response.json();
};

export const setAppProperty = async (propertyKey, value) => {
  const appId = await getAppId();
  const response = await requestJira(
    `/rest/api/3/addons/${appId}/properties/${propertyKey}`,
    {
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to set app property: ${errorText}`);
  }
};