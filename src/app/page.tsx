import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import RuangGerak from "@/sections/RuangGerak";
import Cerita from "@/sections/Cerita";
import Contact from "@/sections/Contact";
import { getAnnouncementBar, getNavigationItems, getFooterData, getHeroData, getAboutData, getRuangGerakCategories, getCeritaData, getGalleryItems, getContactData } from "@/lib/public-data";

export default async function Home() {
  const [
    announcementBar,
    navigationItems,
    footerData,
    heroData,
    aboutData,
    ruangGerakCategories,
    ceritaData,
    galleryItems,
    contactData,
  ] = await Promise.all([
    getAnnouncementBar(),
    getNavigationItems(),
    getFooterData(),
    getHeroData(),
    getAboutData(),
    getRuangGerakCategories(),
    getCeritaData(),
    getGalleryItems(),
    getContactData(),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <AnnouncementBar data={announcementBar} />
      <Navigation items={navigationItems} />
      <main className="flex-1">
        <Hero data={heroData} />
        <About data={aboutData} />
        <RuangGerak categories={ruangGerakCategories} />
        <Cerita data={ceritaData} galleryItems={galleryItems} />
        <Contact data={contactData} />
      </main>
      <Footer data={footerData} />
    </div>
  );
}