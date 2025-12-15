'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from '@react-pdf/renderer'

// Registrar fontes
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
})

const colors = {
  primary: '#f97316',
  secondary: '#a855f7',
  dark: '#18181b',
  gray: '#71717a',
  lightGray: '#f4f4f5',
  white: '#ffffff',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    padding: 50,
    fontFamily: 'Inter',
  },
  coverPage: {
    backgroundColor: colors.dark,
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  coverBadge: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: '8 16',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 30,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 1.2,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 1.5,
  },
  coverHighlight: {
    color: colors.primary,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: 'center',
  },
  coverLogo: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
  },
  coverYear: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 5,
  },
  chapterPage: {
    backgroundColor: colors.primary,
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  chapterNumber: {
    fontSize: 80,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  chapterTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.white,
    marginBottom: 10,
  },
  chapterSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.5,
  },
  contentPage: {
    padding: 50,
  },
  pageHeader: {
    borderBottom: `1 solid ${colors.lightGray}`,
    paddingBottom: 10,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 10,
    color: colors.gray,
  },
  headerLogo: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.dark,
    marginBottom: 15,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 11,
    color: colors.gray,
    lineHeight: 1.7,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bulletPoint: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    marginRight: 10,
    marginTop: 5,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: colors.gray,
    lineHeight: 1.6,
  },
  infoBox: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderLeft: `3 solid ${colors.primary}`,
  },
  infoBoxTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.dark,
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 10,
    color: colors.gray,
    lineHeight: 1.6,
  },
  table: {
    marginVertical: 15,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: `1 solid ${colors.lightGray}`,
  },
  tableHeader: {
    backgroundColor: colors.dark,
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 10,
  },
  tableCellHeader: {
    color: colors.white,
    fontWeight: 600,
  },
  tableCellBody: {
    color: colors.gray,
  },
  highlight: {
    color: colors.primary,
    fontWeight: 600,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 10,
    color: colors.gray,
  },
  ctaBox: {
    backgroundColor: colors.dark,
    padding: 25,
    borderRadius: 8,
    marginTop: 30,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.white,
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 11,
    color: '#a1a1aa',
    marginBottom: 15,
    lineHeight: 1.5,
  },
  ctaLink: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.primary,
  },
  numberedItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  numberCircle: {
    width: 24,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.white,
  },
  numberedContent: {
    flex: 1,
  },
  numberedTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.dark,
    marginBottom: 4,
  },
  numberedDescription: {
    fontSize: 10,
    color: colors.gray,
    lineHeight: 1.5,
  },
})

// Componente de capa
const CoverPage = () => (
  <Page size="A4" style={styles.coverPage}>
    <View>
      <Text style={styles.coverBadge}>EBOOK GRATUITO</Text>
      <Text style={styles.coverTitle}>
        Metodologia Completa de{'\n'}
        <Text style={styles.coverHighlight}>Análise de Mercado{'\n'}Imobiliário</Text>
      </Text>
      <Text style={styles.coverSubtitle}>
        O guia definitivo para incorporadoras que querem{'\n'}
        lançar empreendimentos com segurança e precisão
      </Text>
    </View>
    <View style={styles.coverFooter}>
      <Text style={styles.coverLogo}>RPK Análise</Text>
      <Text style={styles.coverYear}>2025 - Todos os direitos reservados</Text>
    </View>
  </Page>
)

// Componente de página de capítulo
const ChapterPage = ({ number, title, subtitle }: { number: string; title: string; subtitle: string }) => (
  <Page size="A4" style={styles.chapterPage}>
    <Text style={styles.chapterNumber}>{number}</Text>
    <Text style={styles.chapterTitle}>{title}</Text>
    <Text style={styles.chapterSubtitle}>{subtitle}</Text>
  </Page>
)

// Componente de conteúdo
const ContentPage = ({ chapterTitle, children }: { chapterTitle: string; children: React.ReactNode }) => (
  <Page size="A4" style={styles.contentPage}>
    <View style={styles.pageHeader}>
      <Text style={styles.headerTitle}>{chapterTitle}</Text>
      <Text style={styles.headerLogo}>RPK Análise</Text>
    </View>
    {children}
    <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
  </Page>
)

// Componente principal do PDF
export default function EbookPDF() {
  return (
    <Document>
      {/* Capa */}
      <CoverPage />

      {/* Sumário */}
      <Page size="A4" style={styles.contentPage}>
        <Text style={styles.sectionTitle}>Sumário</Text>
        <View style={{ marginTop: 20 }}>
          {[
            { num: '01', title: 'Por que análise de mercado é essencial' },
            { num: '02', title: 'Coleta de dados: fontes oficiais' },
            { num: '03', title: 'Análise demográfica e econômica' },
            { num: '04', title: 'Mapeamento de concorrentes' },
            { num: '05', title: 'Cálculo de público qualificado' },
            { num: '06', title: 'Análise SWOT imobiliária' },
            { num: '07', title: 'Definição de personas' },
            { num: '08', title: 'Estratégia de marketing' },
            { num: '09', title: 'Checklist de implementação' },
            { num: '10', title: 'Próximos passos' },
          ].map((item, index) => (
            <View key={index} style={{ display: 'flex', flexDirection: 'row', marginBottom: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: 700, color: colors.primary, width: 40 }}>{item.num}</Text>
              <Text style={{ fontSize: 12, color: colors.dark, flex: 1 }}>{item.title}</Text>
              <Text style={{ fontSize: 10, color: colors.gray }}>pg. {(index + 1) * 2 + 1}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Capítulo 1 */}
      <ChapterPage
        number="01"
        title="Por que análise de mercado é essencial"
        subtitle="Entenda como dados podem transformar suas decisões de lançamento"
      />
      <ContentPage chapterTitle="01 - Por que análise de mercado é essencial">
        <Text style={styles.paragraph}>
          O mercado imobiliário brasileiro movimenta mais de R$ 300 bilhões por ano, mas a taxa de insucesso
          em lançamentos permanece alarmantemente alta. Segundo dados do setor, cerca de 40% dos empreendimentos
          não atingem suas metas de vendas no primeiro ano.
        </Text>
        <Text style={styles.paragraph}>
          A principal causa? Decisões baseadas em intuição ao invés de dados. Incorporadoras que investem em
          análise de mercado antes do lançamento apresentam resultados significativamente melhores.
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Dados do Setor</Text>
          <Text style={styles.infoBoxText}>
            Incorporadoras que utilizam análise de mercado estruturada têm 3x mais chances de atingir
            suas metas de vendas no primeiro trimestre após o lançamento.
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Os 5 erros mais comuns</Text>
        {[
          'Não estudar a concorrência local antes de definir preços',
          'Ignorar dados demográficos da região',
          'Não calcular o público realmente qualificado',
          'Basear campanhas em achismos ao invés de personas',
          'Lançar sem entender o momento econômico da cidade',
        ].map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </ContentPage>

      {/* Capítulo 2 */}
      <ChapterPage
        number="02"
        title="Coleta de dados: fontes oficiais"
        subtitle="Onde encontrar informações confiáveis e gratuitas"
      />
      <ContentPage chapterTitle="02 - Coleta de dados: fontes oficiais">
        <Text style={styles.paragraph}>
          A qualidade da sua análise depende diretamente da qualidade dos dados utilizados.
          Felizmente, o Brasil possui diversas fontes oficiais gratuitas que fornecem informações
          precisas e atualizadas.
        </Text>
        <Text style={styles.sectionTitle}>Principais fontes de dados</Text>
        {[
          { title: 'IBGE Cidades', desc: 'População, PIB, densidade demográfica, IDH e indicadores sociais' },
          { title: 'CAGED/MTE', desc: 'Dados de emprego formal, salários médios por setor e movimentação' },
          { title: 'Banco Central', desc: 'Indicadores financeiros, taxas de juros, financiamento imobiliário' },
          { title: 'Prefeituras', desc: 'Plano diretor, zoneamento, alvarás e tendências de expansão' },
          { title: 'Portais imobiliários', desc: 'Preços praticados, oferta atual, velocidade de vendas' },
        ].map((item, index) => (
          <View key={index} style={styles.numberedItem}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.numberedContent}>
              <Text style={styles.numberedTitle}>{item.title}</Text>
              <Text style={styles.numberedDescription}>{item.desc}</Text>
            </View>
          </View>
        ))}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Dica Pro</Text>
          <Text style={styles.infoBoxText}>
            Cruze dados de múltiplas fontes para validar informações. Se o IBGE indica crescimento
            populacional e o CAGED mostra aumento de empregos formais, você tem confirmação dupla
            de uma tendência positiva.
          </Text>
        </View>
      </ContentPage>

      {/* Capítulo 3 */}
      <ChapterPage
        number="03"
        title="Análise demográfica e econômica"
        subtitle="Interpretando os números para decisões estratégicas"
      />
      <ContentPage chapterTitle="03 - Análise demográfica e econômica">
        <Text style={styles.paragraph}>
          Entender o perfil demográfico e econômico de uma cidade é fundamental para dimensionar
          corretamente seu empreendimento e definir o público-alvo.
        </Text>
        <Text style={styles.sectionTitle}>Indicadores essenciais</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Indicador</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>O que revela</Text>
          </View>
          {[
            { ind: 'População', rev: 'Tamanho do mercado potencial' },
            { ind: 'Crescimento pop.', rev: 'Tendência de demanda' },
            { ind: 'PIB per capita', rev: 'Poder aquisitivo médio' },
            { ind: 'Renda média', rev: 'Capacidade de financiamento' },
            { ind: 'Taxa de emprego', rev: 'Estabilidade econômica' },
            { ind: 'IDH', rev: 'Qualidade de vida e infraestrutura' },
          ].map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBody]}>{item.ind}</Text>
              <Text style={[styles.tableCell, styles.tableCellBody]}>{item.rev}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.paragraph}>
          A análise desses indicadores permite identificar se a cidade comporta seu empreendimento
          e qual faixa de preço é mais adequada para o mercado local.
        </Text>
      </ContentPage>

      {/* Capítulo 4 */}
      <ChapterPage
        number="04"
        title="Mapeamento de concorrentes"
        subtitle="Conheça seu mercado antes de entrar nele"
      />
      <ContentPage chapterTitle="04 - Mapeamento de concorrentes">
        <Text style={styles.paragraph}>
          O mapeamento de concorrentes vai além de saber quem está vendendo na região.
          É preciso entender estratégias de preço, diferencias, velocidade de vendas e
          posicionamento de mercado.
        </Text>
        <Text style={styles.sectionTitle}>Dados a coletar de cada concorrente</Text>
        {[
          'Nome do empreendimento e incorporadora',
          'Localização exata e distância do seu terreno',
          'Tipologias oferecidas (1, 2, 3 quartos)',
          'Metragem das unidades',
          'Preço por m² e valor total',
          'Diferenciais de lazer e acabamento',
          'Estágio da obra e previsão de entrega',
          'Quantidade de unidades e estoque disponível',
        ].map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Onde encontrar</Text>
          <Text style={styles.infoBoxText}>
            Portais como VivaReal, Zap Imóveis e OLX listam empreendimentos com detalhes.
            Sites das incorporadoras e visitas presenciais aos stands completam a pesquisa.
          </Text>
        </View>
      </ContentPage>

      {/* Capítulo 5 */}
      <ChapterPage
        number="05"
        title="Cálculo de público qualificado"
        subtitle="Quantas pessoas realmente podem comprar seu imóvel"
      />
      <ContentPage chapterTitle="05 - Cálculo de público qualificado">
        <Text style={styles.paragraph}>
          Um dos erros mais comuns é superestimar o público-alvo. O público qualificado
          é a parcela da população que efetivamente tem condições de adquirir seu imóvel.
        </Text>
        <Text style={styles.sectionTitle}>Fórmula do Público Qualificado</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Cálculo</Text>
          <Text style={styles.infoBoxText}>
            Renda necessária = (Valor do imóvel × 0,003) + Custos mensais{'\n'}
            Público = Famílias com renda {'>'}= Renda necessária
          </Text>
        </View>
        <Text style={styles.paragraph}>
          Por exemplo, para um imóvel de R$ 500.000, a parcela aproximada seria R$ 1.500
          (considerando 30 anos). Somando condomínio e IPTU, a renda mínima necessária
          seria em torno de R$ 5.000 (30% da renda comprometida).
        </Text>
        <Text style={styles.sectionTitle}>Fatores de ajuste</Text>
        {[
          'Desconte famílias que já possuem imóvel próprio',
          'Considere taxa de juros atual do financiamento',
          'Avalie comprometimento máximo de renda aceito pelos bancos',
          'Inclua entrada mínima necessária (geralmente 20%)',
        ].map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </ContentPage>

      {/* Capítulo 6 */}
      <ChapterPage
        number="06"
        title="Análise SWOT imobiliária"
        subtitle="Forças, fraquezas, oportunidades e ameaças"
      />
      <ContentPage chapterTitle="06 - Análise SWOT imobiliária">
        <Text style={styles.paragraph}>
          A análise SWOT adaptada ao mercado imobiliário permite uma visão 360° do seu
          empreendimento, identificando vantagens competitivas e pontos de atenção.
        </Text>
        <Text style={styles.sectionTitle}>Forças (Strengths)</Text>
        <Text style={styles.paragraph}>
          Localização privilegiada, vista, acesso a transporte, diferenciais de projeto,
          reputação da incorporadora, condições de pagamento.
        </Text>
        <Text style={styles.sectionTitle}>Fraquezas (Weaknesses)</Text>
        <Text style={styles.paragraph}>
          Metragem inferior à concorrência, falta de vaga de garagem, acabamento básico,
          prazo de entrega longo, marca pouco conhecida.
        </Text>
        <Text style={styles.sectionTitle}>Oportunidades (Opportunities)</Text>
        <Text style={styles.paragraph}>
          Crescimento da região, novos empreendimentos comerciais, melhorias de infraestrutura,
          demanda reprimida, taxa de juros favorável.
        </Text>
        <Text style={styles.sectionTitle}>Ameaças (Threats)</Text>
        <Text style={styles.paragraph}>
          Lançamentos concorrentes, instabilidade econômica, mudanças regulatórias,
          valorização excessiva do terreno, falta de financiamento.
        </Text>
      </ContentPage>

      {/* Capítulo 7 */}
      <ChapterPage
        number="07"
        title="Definição de personas"
        subtitle="Quem são seus compradores ideais"
      />
      <ContentPage chapterTitle="07 - Definição de personas">
        <Text style={styles.paragraph}>
          Personas são representações fictícias dos seus clientes ideais, baseadas em dados
          reais. Elas guiam todas as decisões de marketing e vendas.
        </Text>
        <Text style={styles.sectionTitle}>Persona Exemplo: Investidor Iniciante</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Carlos, 35 anos</Text>
          <Text style={styles.infoBoxText}>
            Engenheiro, renda de R$ 15.000/mês, casado, 1 filho.{'\n'}
            Busca primeiro investimento imobiliário para renda passiva.{'\n'}
            Preocupações: liquidez, valorização, gestão do aluguel.{'\n'}
            Canais: LinkedIn, YouTube, podcasts de finanças.
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Elementos de uma persona</Text>
        {[
          'Dados demográficos (idade, renda, profissão, família)',
          'Objetivos e motivações de compra',
          'Dores e objeções principais',
          'Canais de comunicação preferidos',
          'Comportamento de pesquisa e decisão',
        ].map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </ContentPage>

      {/* Capítulo 8 */}
      <ChapterPage
        number="08"
        title="Estratégia de marketing"
        subtitle="Do lançamento à última unidade"
      />
      <ContentPage chapterTitle="08 - Estratégia de marketing">
        <Text style={styles.paragraph}>
          Uma estratégia de marketing imobiliário eficiente é dividida em fases,
          cada uma com objetivos e táticas específicas.
        </Text>
        <Text style={styles.sectionTitle}>As 4 fases do marketing imobiliário</Text>
        {[
          { title: 'Pré-lançamento', desc: 'Gerar expectativa, captar leads, criar lista de espera' },
          { title: 'Lançamento', desc: 'Conversão máxima, evento de vendas, ofertas especiais' },
          { title: 'Sustentação', desc: 'Manter fluxo de vendas, ajustar estratégia, remarketing' },
          { title: 'Últimas unidades', desc: 'Senso de urgência, descontos pontuais, conversão do estoque' },
        ].map((item, index) => (
          <View key={index} style={styles.numberedItem}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.numberedContent}>
              <Text style={styles.numberedTitle}>{item.title}</Text>
              <Text style={styles.numberedDescription}>{item.desc}</Text>
            </View>
          </View>
        ))}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Budget sugerido</Text>
          <Text style={styles.infoBoxText}>
            Invista entre 3% a 5% do VGV em marketing. Para um empreendimento de R$ 50 milhões,
            reserve entre R$ 1,5 e R$ 2,5 milhões para a estratégia completa.
          </Text>
        </View>
      </ContentPage>

      {/* Capítulo 9 */}
      <ChapterPage
        number="09"
        title="Checklist de implementação"
        subtitle="Passo a passo para colocar em prática"
      />
      <ContentPage chapterTitle="09 - Checklist de implementação">
        <Text style={styles.paragraph}>
          Use este checklist como guia para implementar a análise de mercado no seu
          próximo lançamento.
        </Text>
        <Text style={styles.sectionTitle}>Semanas 1-4: Pesquisa</Text>
        {[
          'Coletar dados demográficos da cidade (IBGE)',
          'Levantar indicadores econômicos (CAGED, BCB)',
          'Mapear todos os concorrentes num raio de 3km',
          'Visitar stands e coletar materiais',
        ].map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
        <Text style={styles.sectionTitle}>Semanas 5-8: Análise</Text>
        {[
          'Calcular público qualificado',
          'Montar análise SWOT completa',
          'Definir 3 personas principais',
          'Criar tabela comparativa de preços',
        ].map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
        <Text style={styles.sectionTitle}>Semanas 9-12: Estratégia</Text>
        {[
          'Definir posicionamento e diferenciais',
          'Criar plano de marketing por fases',
          'Desenvolver argumentário de vendas',
          'Treinar equipe comercial',
        ].map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </ContentPage>

      {/* Capítulo 10 - CTA */}
      <ChapterPage
        number="10"
        title="Próximos passos"
        subtitle="Transforme conhecimento em resultados"
      />
      <ContentPage chapterTitle="10 - Próximos passos">
        <Text style={styles.paragraph}>
          Agora que você conhece a metodologia completa de análise de mercado imobiliário,
          é hora de colocar em prática. Mas sabemos que executar tudo isso manualmente
          consome tempo e recursos.
        </Text>
        <Text style={styles.paragraph}>
          Por isso, criamos o <Text style={styles.highlight}>RPK Análise</Text> - uma plataforma
          que automatiza toda essa metodologia usando Inteligência Artificial.
        </Text>
        <Text style={styles.sectionTitle}>O que você recebe automaticamente:</Text>
        {[
          'Análise demográfica completa da cidade',
          'Mapeamento de concorrentes com preços e diferenciais',
          'Cálculo preciso do público qualificado',
          'Análise SWOT com 40+ pontos estratégicos',
          '3 personas detalhadas do seu público',
          'Plano de marketing em 4 fases',
          '18 chamadas publicitárias prontas para usar',
        ].map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Crie seu diagnóstico gratuito</Text>
          <Text style={styles.ctaText}>
            Em menos de 5 minutos você terá uma análise completa do mercado
            para seu próximo empreendimento.
          </Text>
          <Link src="https://rpk-analise.vercel.app/criar">
            <Text style={styles.ctaLink}>rpk-analise.vercel.app/criar →</Text>
          </Link>
        </View>
      </ContentPage>
    </Document>
  )
}
