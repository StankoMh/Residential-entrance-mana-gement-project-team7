import { Calendar, Vote, Receipt, Archive, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Събития',
    description: 'Създавайте събития, уведомявайте жителите и следете за предстоящи срещи'
  },
  {
    icon: Vote,
    title: 'Гласувания',
    description: 'Организирайте гласувания и проследявайте резултатите'
  },
  {
    icon: Receipt,
    title: 'Плащания',
    description: 'Управление на такси, вноски и разходи с поддръжка на Stripe, кеш и банкови преводи'
  },
  {
    icon: Archive,
    title: 'Архив на документи',
    description: 'Съхранявайте протоколи, правилници, договори и решения'
  },
  {
    icon: Users,
    title: 'Управление на жители',
    description: 'Управление на апартаменти и контрол на достъпа'
  },
  {
    icon: Shield,
    title: 'Сигурност',
    description: 'Автентикация и защитен достъп до информацията на вашия вход'
  }
];

export function Features() {
  return (
    <section className="py-7 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-blue-900">Възможности на платформата</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Всичко необходимо за ефективно управление на вашия жилищен вход на едно място
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}