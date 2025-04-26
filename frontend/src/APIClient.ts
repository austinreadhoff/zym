const apiUrl = process.env.REACT_APP_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    var data = await res.json();
    return {response: res, data};
}
