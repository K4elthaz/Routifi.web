import { Link } from "react-router-dom";
import QuoteSlideshow from "./quote-slideshow";

export default function HeroBanner() {
  return (
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex select-none">
      <div className="absolute inset-0 bg-zinc-900 " />

      <div className="relative z-20 flex items-center text-lg font-medium">
        <Link to="/">
          <img
            className="h-auto w-auto max-w-full max-h-full"
            src="/ROUTIFI.png"
            alt="prospect"
            width={300}
            height={500}
          />
        </Link>
      </div>

      <div className="relative z-20 mt-auto mx-auto flex w-full justify-center items-center lg:flex-col rounded-lg select-none">
        <div className="relative">
          <p className="absolute inset-0 z-30 flex justify-center items-center text-white text-center text-2xl font-bold bg-black bg-opacity-50 p-4 rounded-lg m-4">
            &quot;Join our growing community of innovators and
            entrepreneurs&quot;
          </p>
          <img
            className="h-auto w-auto max-w-full max-h-full opacity-90 rounded-lg shadow-lg "
            src="/hero.png"
            alt="prospect"
            width={700}
            height={800}
          />
        </div>
      </div>

      <div className="relative z-20 mt-auto">
        <QuoteSlideshow />
      </div>
    </div>
  );
}
