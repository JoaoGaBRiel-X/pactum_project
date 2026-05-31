import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BacenService {
  private readonly logger = new Logger(BacenService.name);

  /**
   * Consulta os últimos 12 registros de uma série temporal do SGS/Bacen
   * e calcula a taxa acumulada do período.
   * 
   * Códigos Comuns:
   * 189 = IGPM (FGV)
   * 433 = IPCA (IBGE)
   * 
   * @param seriesCode Código da série no SGS
   * @returns Taxa acumulada nos últimos 12 meses (em porcentagem)
   */
  async fetchAccumulatedRate(seriesCode: number): Promise<number> {
    try {
      const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados/ultimos/12?formato=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro na API do Bacen: ${response.statusText}`);
      }
      
      const data: Array<{ data: string; valor: string }> = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error(`Série ${seriesCode} vazia.`);
      }

      // Fórmula de Acumulado: Produto de (1 + taxa/100)
      let product = 1;
      for (const item of data) {
        const rate = parseFloat(item.valor) / 100;
        product *= (1 + rate);
      }
      
      const accumulatedRate = (product - 1) * 100;
      this.logger.log(`BACEN Série ${seriesCode}: Calculado acumulado de ${accumulatedRate.toFixed(4)}% em ${data.length} meses.`);
      
      return accumulatedRate;
    } catch (error) {
      this.logger.error(`Falha ao buscar/calcular série ${seriesCode} do Bacen`, error);
      throw error;
    }
  }
}
