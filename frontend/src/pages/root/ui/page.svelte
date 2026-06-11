<script lang="ts">
import {
  Activity,
  ChevronRight,
  Cpu,
  Eye,
  Globe,
  Lock,
  Network,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-svelte";
import favicon from "$shared/assets/favicon.svg";
import logo from "$shared/assets/logo.svg";
import OrbitingCircles from "$shared/magic/orbiting-circles/orbiting-circles.svelte";
import Particles from "$shared/magic/particles/particles.svelte";

const stats = [
  {
    label: "Фрагментация VPN",
    value: "72%",
    description: "Компаний поддерживают от 2 до 5 разных VPN-сервисов",
  },
  {
    label: "Уязвимость",
    value: "48%",
    description: "Компаний переживали атаки через VPN-инфраструктуру",
  },
  {
    label: "Потери времени",
    value: "83%",
    description: "Пользователей сталкиваются с потерей продуктивности",
  },
  {
    label: "Запрос рынка",
    value: "57%",
    description: "Компаний хотят радикального упрощения инфраструктуры",
  },
];

const features = [
  {
    title: "Zero Trust доступ",
    description:
      "Забудьте о широком доступе к сети. Каждое соединение должно быть явно разрешено политиками.",
    icon: ShieldCheck,
  },
  {
    title: "На базе WireGuard",
    description:
      "Использование самого современного и быстрого протокола шифрования для защиты ваших данных.",
    icon: Zap,
  },
  {
    title: "Визуальное управление",
    description:
      "Управляйте топологией сети, устройствами и правилами доступа через интуитивно понятный интерфейс.",
    icon: Eye,
  },
  {
    title: "Централизованный аудит",
    description:
      "Полная видимость всех подключений и событий в вашей виртуальной инфраструктуре.",
    icon: Activity,
  },
];
</script>

<div
  class="min-h-screen bg-zinc-950 text-slate-50 selection:bg-slate-200 selection:text-zinc-950 overflow-x-hidden relative"
>
  <!-- Dynamic Space Background -->
  <div class="fixed inset-0 pointer-events-none z-0">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,30,60,0.4),transparent_80%)]"
    ></div>
    <Particles
      class="absolute inset-0"
      quantity={200}
      staticity={30}
      ease={50}
      size={0.6}
      color="#ffffff"
    />
  </div>

  <!-- Nav -->
  <nav
    class="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <a
        href="/#"
        class="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img src={logo} alt="Qnlink Logo" class="h-8">
      </a>
      <div
        class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400"
      >
        <a href="#stats" class="hover:text-slate-50 transition-colors">
          Аналитика
        </a>
        <a href="#features" class="hover:text-slate-50 transition-colors">
          Возможности
        </a>
        <a
          href="/app"
          class="px-4 py-2 bg-slate-50 text-zinc-950 rounded-full hover:bg-slate-200 transition-colors"
        >
          Запустить
        </a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section
    class="relative pt-40 pb-20 px-6 flex flex-col items-center justify-center min-h-[85vh] text-center overflow-hidden"
  >
    <!-- Cleaned Background Text -->
    <div
      class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
    >
      <div
        class="relative flex h-[500px] w-full items-center justify-center overflow-hidden"
      >
        <span
          class="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-zinc-700/10 to-zinc-950/5 bg-clip-text text-center text-[12rem] md:text-[18rem] font-bold leading-none text-transparent select-none"
        >
          QN
        </span>
      </div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto">
      <h1 class="text-6xl md:text-8xl font-bold tracking-tight mb-8">
        Сети с <span class="text-slate-400">нулевым</span> доверием
      </h1>
      <p
        class="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
      >
        Простое визуальное управление корпоративной инфраструктурой на базе
        WireGuard. Безопасность промышленного уровня без сложного оборудования.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
        <a
          href="/app"
          class="group px-10 py-5 bg-slate-50 text-zinc-950 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-3 text-lg"
        >
          Начать работу
          <ChevronRight
            class="size-5 group-hover:translate-x-1 transition-transform"
          />
        </a>
        <a
          href="#features"
          class="px-10 py-5 border border-zinc-800 font-bold rounded-2xl hover:bg-zinc-900 transition-colors text-lg"
        >
          Узнать больше
        </a>
      </div>
    </div>
  </section>

  <!-- Problem/Stats Section -->
  <section
    id="stats"
    class="relative py-32 px-6 border-y border-zinc-900 bg-zinc-950/40 backdrop-blur-sm z-10"
  >
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-20">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">Почему Qnlink?</h2>
        <p class="text-slate-400 max-w-2xl mx-auto text-lg font-light">
          Традиционные VPN-решения больше не справляются с современными вызовами
          безопасности и сложности инфраструктуры.
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {#each stats as stat}
          <div
            class="p-10 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex flex-col items-center text-center"
          >
            <div class="text-5xl font-bold text-slate-50 mb-3">
              {stat.value}
            </div>
            <div
              class="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6"
            >
              {stat.label}
            </div>
            <p class="text-sm text-slate-400 leading-relaxed">
              {stat.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="relative py-32 px-6 z-10 overflow-visible">
    <div class="max-w-7xl mx-auto overflow-visible">
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-24 items-center overflow-visible"
      >
        <div>
          <h2 class="text-4xl md:text-5xl font-bold mb-8">
            Сетевая безопасность нового поколения
          </h2>
          <p class="text-slate-400 mb-12 text-xl font-light leading-relaxed">
            Qnlink объединяет простоту настройки и промышленный уровень
            надежности, предоставляя администраторам полный контроль над каждым
            битом трафика.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {#each features as feature}
              {@const Icon = feature.icon}
              <div class="flex flex-col gap-4 group">
                <div
                  class="size-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-slate-50 group-hover:border-slate-500 transition-colors"
                >
                  <Icon class="size-6" />
                </div>
                <h3 class="font-bold text-lg">{feature.title}</h3>
                <p class="text-sm text-slate-400 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            {/each}
          </div>
        </div>
        <div class="relative flex items-center justify-center overflow-visible">
          <div
            class="w-full max-w-[600px] aspect-square flex items-center justify-center overflow-visible"
          >
            <div
              class="relative size-full flex items-center justify-center overflow-visible"
            >
              <div
                class="size-32 bg-slate-50 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(255,255,255,0.2)] z-20"
              >
                <img src={favicon} alt="Node" class="size-16 invert">
              </div>

              <!-- Inner Orbit -->
              <OrbitingCircles
                class="border-none bg-transparent"
                radius={160}
                duration={20}
                iconSize={44}
                path
              >
                <div
                  class="bg-zinc-900 border border-zinc-800 size-11 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <Cpu class="size-5 text-slate-50" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles
                class="border-none bg-transparent"
                radius={160}
                duration={20}
                delay={-10}
                iconSize={44}
              >
                <div
                  class="bg-zinc-900 border border-zinc-800 size-11 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <Lock class="size-5 text-slate-400" />
                </div>
              </OrbitingCircles>

              <!-- Outer Orbit -->
              <OrbitingCircles
                class="border-none bg-transparent"
                radius={280}
                duration={35}
                reverse
                iconSize={52}
                path
              >
                <div
                  class="bg-zinc-900 border border-zinc-800 size-14 rounded-full flex items-center justify-center shadow-2xl border-dashed"
                >
                  <Globe class="size-7 text-slate-200" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles
                class="border-none bg-transparent"
                radius={280}
                duration={35}
                delay={-17.5}
                reverse
                iconSize={52}
              >
                <div
                  class="bg-zinc-900 border border-zinc-800 size-14 rounded-full flex items-center justify-center shadow-2xl border-dashed"
                >
                  <Users class="size-7 text-slate-400" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles
                class="border-none bg-transparent"
                radius={280}
                duration={35}
                delay={-8.75}
                reverse
                iconSize={52}
              >
                <div
                  class="bg-zinc-900 border border-zinc-800 size-14 rounded-full flex items-center justify-center shadow-2xl border-dashed"
                >
                  <Activity class="size-7 text-slate-300" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles
                class="border-none bg-transparent"
                radius={280}
                duration={35}
                delay={-26.25}
                reverse
                iconSize={52}
              >
                <div
                  class="bg-zinc-900 border border-zinc-800 size-14 rounded-full flex items-center justify-center shadow-2xl border-dashed"
                >
                  <Network class="size-7 text-slate-50" />
                </div>
              </OrbitingCircles>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="relative py-32 px-6 z-10">
    <div
      class="max-w-5xl mx-auto p-16 bg-slate-50 rounded-[3rem] text-zinc-950 flex flex-col items-center text-center shadow-[0_0_100px_rgba(255,255,255,0.05)]"
    >
      <h2 class="text-4xl md:text-6xl font-bold mb-8">
        Готовы обновить свою сеть?
      </h2>
      <p class="text-xl opacity-70 mb-12 max-w-xl font-medium leading-relaxed">
        Присоединяйтесь к компаниям, которые уже перешли на современные принципы
        Zero Trust. Развертывание занимает считанные минуты.
      </p>
      <a
        href="/app"
        class="px-12 py-6 bg-zinc-950 text-slate-50 font-bold rounded-2xl hover:scale-105 transition-transform text-xl shadow-xl"
      >
        Запустить Qnlink прямо сейчас
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer
    class="relative py-16 px-6 border-t border-zinc-900 z-10 bg-zinc-950/80 backdrop-blur-sm"
  >
    <div
      class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8"
    >
      <div class="flex items-center gap-6">
        <img src={logo} alt="Qnlink Logo" class="h-8 opacity-30">
        <span class="text-sm text-slate-600">
          © 2026 Qnlink. Все права защищены.
        </span>
      </div>
      <div class="flex items-center gap-10 text-sm font-bold text-slate-600">
        <span class="tracking-widest uppercase text-xs">qnlink.uz</span>
        <a
          href="https://github.com/arizona-bebras/virtual-networks"
          target="_blank"
          class="hover:text-slate-400 transition-colors uppercase tracking-widest text-xs"
        >
          GitHub
        </a>
      </div>
    </div>
  </footer>
</div>

<style>
:global(html) {
  scroll-behavior: smooth;
  background-color: #09090b;
}
</style>
