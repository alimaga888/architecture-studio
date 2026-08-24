import FeaturedProjects from "../components/FeaturedProjects";
import OrderSection from "../components/OrderSection";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import Reviews from "../components/Reviews";
import DocumentationSlider from "../components/DocumentationSlider";

function Home() {
  return (
    <>
      <Reveal>
        <section id="projects">
          <FeaturedProjects />
        </section>
      </Reveal>

      <Reveal>
        <DocumentationSlider />
      </Reveal>

      {/* <Reveal>
        <ProjectViewer />
      </Reveal> */}

      <Reveal>
        <section id="order">
          <OrderSection />
        </section>
      </Reveal>

      <Reveal>
        <section id="faq">
          <FAQ />
        </section>
      </Reveal>

      <Reveal>
        <section id="reviews">
          <Reviews />
        </section>
      </Reveal>

      <footer id="contacts">
        <Footer />
      </footer>
    </>
  );
}

export default Home;
