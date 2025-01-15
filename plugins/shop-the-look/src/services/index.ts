import axios from "axios";
import { APP_URL } from "./constant";

export const authClient = axios.create({
    baseURL: APP_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export const saveImageToBuilder = async (data: any, fileName: string) => {
    try {
        const fileType = data?.name?.split('.')?.at(-1);
        const formData = new FormData();
        formData.append('file', data);
        formData.append('fileName', `${fileName}.${fileType}`);
        const response = await axios.post(`${APP_URL}/imageUpload/save`, formData);
        return response;
    } catch (err) {
        throw new Error("Error at sending Image to BE...")
    }
}

export const saveHotspots = async (data: any) => {
    const response = await axios.post(`${APP_URL}/data/save`, data);
    return response.data;
}

export const updateHotspots = async (data: any) => {
    const response = await axios.put(`${APP_URL}/data/update`, data);
    return response.data;
}

export const getAllData = async () => {
    const response = await authClient.get(`${APP_URL}/data/getAll`);
    return response.data;
}

export const getByIdData = async (id: string) => {
    const response = await authClient.post(`${APP_URL}/data/getbyId`, { id });
    return response.data;
}

export const deleteLookbookData = async (id: string) => {
    const response = await authClient.post(`${APP_URL}/data/delete`, { id });
    return response.data;
}