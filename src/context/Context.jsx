import { createContext, useState } from "react";
import { runGemini } from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [response, setResponse] = useState("");

    const onSent = async (prompt) => {
        try {
            const res = await runGemini(prompt);
            setResponse(res);
            return res;
        } catch (error) {
            setResponse("Bir hata oluştu.");
            console.error(error);
        }
    };

    const contextValue = {
        response,
        onSent,
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;