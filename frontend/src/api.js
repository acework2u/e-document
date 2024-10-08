const api = {
    async getHello() {
        const response = await fetch('/e-document');
        const data = await response.json();
        return data.message;
    }

}

export  default api

