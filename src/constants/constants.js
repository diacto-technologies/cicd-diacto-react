import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const currentDate = new Date()

export const logFeature = async (orgId, featureId) => {
    try {
        const response = await fetch(`${api}/business_models/use-feature/${orgId}/${featureId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include authentication headers if required
            },
        });

        if (response.ok) {
            console.log('Feature usage recorded successfully.');
        } else {
            console.error('Failed to record feature usage.');
        }
    } catch (error) {
        console.error('Error recording feature usage:', error);
    }
};

export const maskNumber = (number) => {
    return ("*").repeat(number.length < 5 ? 5 : number.length)
}

export const handleCopyToClipboard = (item) => {


    navigator.clipboard.writeText(item)
        .then(() => {
            toast.success('Copied to clipboard', {
                className: 'text-sm',
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
        })
        .catch((err) => {
            console.error('Something went wrong!', err);
        });
};

export const getServiceIcon = (serviceKey) => {
    if (serviceKey === "resume-screening") {
        return "fa-solid fa-file-lines"
    } else if (serviceKey === "personality-screening") {
        return "fa-solid fa-users-rectangle"
    }
    else if (serviceKey === "test") {
        return "fa-solid fa-cubes"
    }
    else if (serviceKey === "ai-interview") {
        return "fa-solid fa-tv"
    }
}

export const selectStyle = {
    menu: (provided, state) => ({
        ...provided,
        zIndex: 9999, // Adjust the zIndex as needed
    }),
    dropdownIndicator: styles => ({
        ...styles,
        color: 'black',
        fontSize: "0px",
    }),
    indicatorSeparator: styles => ({
        ...styles,
        width: '0px'
    }),
    placeholder: (base) => ({
        ...base,
        fontSize: '1em',
        fontWeight: 400,
    }),
    multiValueLabel: (styles) => ({
        ...styles,
        backgroundColor: '#f0f0ff',
        color: "#5a5ac7"
    }),
    multiValueRemove: (styles, { data }) => ({
        ...styles,
        backgroundColor: '#f0f0ff',
        ':hover': {
            backgroundColor: '#cfcfff',
            color: '#5a5ac7',
        },
    }),
}

export const selectTheme = (theme) => ({
    ...theme,
    borderRadius: "6px",
    colors: {
        ...theme.colors,
        primary25: '#ebebf5', // Light shade on option hover
        primary: '#7474f3', // Main primary color for focused/active states
        primary50: '#7474f3', // Medium shade on option selection
    },
});

export const api = process.env.REACT_APP_API_URL

