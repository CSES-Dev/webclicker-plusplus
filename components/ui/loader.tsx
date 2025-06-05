import { Loader } from "lucide-react";

const LoaderComponent = ({ size = 40 }: { size: number }) => {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <Loader height={size} width={size} className="animate-spin" />
        </div>
    );
};

export default LoaderComponent;
