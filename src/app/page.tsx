import Link from 'next/link'
import { ArrowRightIcon, ChartBarIcon, PhotoIcon, GlobeAltIcon, PuzzlePieceIcon, DevicePhoneMobileIcon, TruckIcon, RocketLaunchIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { FadeInUp, StaggerContainer, StaggerItem, FloatingElement } from '@/components/scroll-animations'

export default function Home() {
  const categories = [
    { name: 'Nature', slug: 'nature', count: 150, color: 'bg-green-500', icon: <GlobeAltIcon className="w-6 h-6" /> },
    { name: 'Abstract', slug: 'abstract', count: 120, color: 'bg-purple-500', icon: <PuzzlePieceIcon className="w-6 h-6" /> },
    { name: 'Gaming', slug: 'gaming', count: 89, color: 'bg-blue-500', icon: <DevicePhoneMobileIcon className="w-6 h-6" /> },
    { name: 'Cars', slug: 'cars', count: 67, color: 'bg-red-500', icon: <TruckIcon className="w-6 h-6" /> },
    { name: 'Space', slug: 'space', count: 45, color: 'bg-indigo-500', icon: <RocketLaunchIcon className="w-6 h-6" /> },
    { name: 'Minimalist', slug: 'minimalist', count: 78, color: 'bg-gray-500', icon: <Squares2X2Icon className="w-6 h-6" /> },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <FadeInUp delay={0.2}>
            <div className="text-center">
              {/* Interactive Text Hover Effect */}
              <div className="h-[200px] md:h-[300px] flex items-center justify-center mb-2">
                <TextHoverEffect text="CURATED VISUALS" />
              </div>
              
              <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto font-mono">
                Quality wallpapers made simple.
                Less clutter, more beauty.
              </p>
            </div>
          </FadeInUp>
          
          <FadeInUp delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/gallery"
                className={cn(
                  "btn-brutalist px-8 py-4 text-lg font-bold inline-flex items-center space-x-2",
                  "hover:translate-x-1 hover:translate-y-1"
                )}
              >
                <PhotoIcon className="w-6 h-6" />
                <span>EXPLORE GALLERY</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </FadeInUp>
        </div>

        {/* Animated Decorative Elements */}
        <FloatingElement className="absolute top-10 left-10 opacity-20">
          <div className="w-20 h-20 bg-secondary border-2 border-foreground transform rotate-12"></div>
        </FloatingElement>
        <FloatingElement className="absolute bottom-10 right-10 opacity-20">
          <div className="w-16 h-16 bg-primary border-2 border-foreground transform -rotate-12"></div>
        </FloatingElement>
        <FloatingElement className="absolute top-1/2 left-1/4 opacity-10">
          <div className="w-8 h-8 bg-foreground transform rotate-45"></div>
        </FloatingElement>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-mono uppercase tracking-wide">
                CATEGORIES
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Explore our curated collections across different themes and styles
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <StaggerItem key={category.slug}>
                <Link href={`/category/${category.slug}`} className="group">
                  <div className={cn(
                    "card-brutalist p-6 h-36 flex flex-col justify-between",
                    "group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-foreground/80">
                          {category.icon}
                        </div>
                        <h3 className="text-xl font-bold font-mono uppercase tracking-wide">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70 font-mono">
                        {category.count} wallpapers
                      </span>
                      <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Stats Section with Counter Animation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <CounterAnimation
                  to={500}
                  suffix="+"
                  className="text-4xl md:text-6xl font-bold text-primary mb-2 font-mono"
                />
                <div className="text-lg font-mono uppercase tracking-wide text-foreground/70">
                  Wallpapers
                </div>
              </div>
              <div className="text-center">
                <CounterAnimation
                  to={50}
                  suffix="K+"
                  className="text-4xl md:text-6xl font-bold text-secondary mb-2 font-mono"
                />
                <div className="text-lg font-mono uppercase tracking-wide text-foreground/70">
                  Downloads
                </div>
              </div>
              <div className="text-center">
                <CounterAnimation
                  to={4}
                  suffix="K+"
                  className="text-4xl md:text-6xl font-bold text-primary mb-2 font-mono"
                />
                <div className="text-lg font-mono uppercase tracking-wide text-foreground/70">
                  Users
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* CTA Section */}
      <FadeInUp>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-mono uppercase tracking-wide">
              START EXPLORING
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have transformed their desktops with our brutal aesthetic
            </p>
            <Link
              href="/gallery"
              className={cn(
                "px-8 py-4 text-lg font-bold border-2 border-background bg-background text-primary",
                "hover:bg-secondary hover:border-secondary hover:text-background transition-all duration-200",
                "inline-flex items-center space-x-2 uppercase tracking-wide",
                "shadow-[4px_4px_0px_0px_var(--color-background)] hover:shadow-[2px_2px_0px_0px_var(--color-background)]",
                "hover:translate-x-1 hover:translate-y-1"
              )}
            >
              <ChartBarIcon className="w-6 h-6" />
              <span>VIEW ALL WALLPAPERS</span>
            </Link>
          </div>
        </section>
      </FadeInUp>
    </div>
  )
}
