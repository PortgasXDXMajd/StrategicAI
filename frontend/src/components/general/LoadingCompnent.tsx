import Iconify from './Iconify';

interface LoadingComponentParams {
  text?: string;
}
const LoadingComponent = ({ text }: LoadingComponentParams) => {
  return (
    <div className="flex items-center justify-center space-x-2 w-full h-full">
      <Iconify icon="mdi:loading" className="animate-spin" />
      <p className="font-thin">{text}</p>
    </div>
  );
};

export default LoadingComponent;
